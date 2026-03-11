# -*- coding: utf-8 -*-
"""
完整利润计算模型 - 与Excel模型一致
"""

import pulp
import time
import math
from typing import List, Dict, Optional
from models import *
from coal_database import get_coal
from config import PlantConfig, DEFAULT_CONFIG


class ConstraintRelaxation:
    def __init__(self):
        self.relaxation_log = []
        self.current_level = 0
        self.max_level = 3
        self.strategies = [
            {"name": "strict", "sulfur_mult": 1.0, "refund_ratio": 0.60, "heat_tol": 0},
            {"name": "mild", "sulfur_mult": 1.1, "refund_ratio": 0.55, "heat_tol": 50},
            {"name": "moderate", "sulfur_mult": 1.2, "refund_ratio": 0.50, "heat_tol": 100},
            {"name": "aggressive", "sulfur_mult": 1.3, "refund_ratio": 0, "heat_tol": 200}
        ]
    
    def get_strategy(self, level: int):
        if level >= len(self.strategies):
            return None
        return self.strategies[level]
    
    def log(self, message: str):
        self.relaxation_log.append(f"[Level {self.current_level}] {message}")


class CoalBlendSolver:
    def __init__(self, config: PlantConfig = DEFAULT_CONFIG):
        self.config = config
    
    def solve(self, request: OptimizationRequest) -> OptimizationResult:
        start_time = time.time()
        relaxer = ConstraintRelaxation()
        
        coals = [get_coal(cid) for cid in request.selected_coals if get_coal(cid)]
        if not coals:
            return self._error_result("未找到有效煤种")
        
        for level in range(relaxer.max_level + 1):
            strategy = relaxer.get_strategy(level)
            if not strategy:
                break
            relaxer.current_level = level
            result = self._try_solve(coals, request, strategy, relaxer)
            if result and result.status == "optimal":
                result.relaxation_log = relaxer.relaxation_log
                result.calculation_time = (time.time() - start_time) * 1000
                return result
        
        return self._infeasible_result(relaxer.relaxation_log)
    
    def _try_solve(self, coals: List[CoalType], request: OptimizationRequest, 
                   strategy: Dict, relaxer: ConstraintRelaxation) -> Optional[OptimizationResult]:
        prob = pulp.LpProblem("CoalBlend", pulp.LpMaximize)
        
        x = {c.id: pulp.LpVariable(f"coal_{c.id}", 0, c.max_available) for c in coals}
        total = pulp.lpSum([x[c.id] for c in coals])
        
        weighted_heat = pulp.lpSum([x[c.id] * c.heat_value for c in coals])
        weighted_sulfur = pulp.lpSum([x[c.id] * c.sulfur for c in coals])
        weighted_ash = pulp.lpSum([x[c.id] * c.ash for c in coals])
        
        if request.enable_refund_constraint and self.config.enable_tax_refund:
            low_heat_amount = pulp.lpSum([x[c.id] for c in coals if c.qualifies_for_refund])
            if strategy["refund_ratio"] > 0:
                prob += low_heat_amount >= strategy["refund_ratio"] * total
                relaxer.log(f"退税约束: 低热值煤>= {strategy['refund_ratio']*100:.0f}%")
            else:
                relaxer.log("跳过退税约束（激进模式）")
        
        max_sulfur = self.config.max_sulfur_in_furnace * strategy["sulfur_mult"]
        relaxer.log(f"硫分约束: 入炉硫量 <= {max_sulfur:.2f} t/h")
        
        min_heat = self.config.min_heat_value - strategy["heat_tol"]
        max_heat = self.config.max_heat_value + strategy["heat_tol"]
        prob += weighted_heat >= min_heat * total
        prob += weighted_heat <= max_heat * total
        relaxer.log(f"热值约束: {min_heat:.0f} ~ {max_heat:.0f} kcal/kg")
        
        coal_rate_estimate = 312
        standard_coal_heat = 7000
        required_standard_coal = request.target_power * 10000 * coal_rate_estimate / 1000000 / 10000
        required_heat = required_standard_coal * standard_coal_heat
        prob += weighted_heat >= required_heat * 0.95
        relaxer.log(f"发电需求: 总热值 >= {required_heat*0.95:.0f}")
        
        coal_cost = pulp.lpSum([x[c.id] * c.price for c in coals])
        
        electricity_price = 0.587
        vat_rate = 0.13
        aux_power_rate = 0.061
        revenue = request.target_power * (1 - aux_power_rate) * electricity_price / (1 + vat_rate)
        
        refund = 0
        if request.enable_refund_constraint:
            low_heat_coal = pulp.lpSum([x[c.id] for c in coals if c.qualifies_for_refund])
            refund = low_heat_coal * 6.69
        
        prob += (revenue - coal_cost + refund)
        
        try:
            prob.solve(pulp.PULP_CBC_CMD(msg=0, timeLimit=30))
        except Exception as e:
            relaxer.log(f"求解失败: {str(e)}")
            return None
        
        if pulp.LpStatus[prob.status] != 'Optimal':
            relaxer.log(f"无可行解: {pulp.LpStatus[prob.status]}")
            return None
        
        total_val = pulp.value(total)
        if not total_val or total_val < 0.01:
            relaxer.log("总煤量为0")
            return None
        
        components = []
        low_heat_total = 0
        
        for c in coals:
            amt = pulp.value(x[c.id])
            if amt > 0.001:
                components.append(BlendComponent(
                    coal_id=c.id, name=c.name,
                    amount=round(amt, 4),
                    percentage=round(amt/total_val*100, 2),
                    cost=round(amt * c.price, 2),
                    transport_cost=round(amt * c.transport_cost, 2)
                ))
                if c.qualifies_for_refund:
                    low_heat_total += amt
        
        actual_heat = pulp.value(weighted_heat) / total_val
        actual_sulfur = pulp.value(weighted_sulfur) / total_val
        actual_ash = pulp.value(weighted_ash) / total_val
        
        coal_flow_tph = total_val * 10000 / self.config.operating_hours
        sulfur_in_furnace = coal_flow_tph * actual_sulfur / 100
        
        constraints_status = []
        constraints_status.append(ConstraintStatus(
            name="入炉硫量",
            required=self.config.max_sulfur_in_furnace,
            actual=round(sulfur_in_furnace, 3),
            status=ConstraintType.STRICT if sulfur_in_furnace <= self.config.max_sulfur_in_furnace else ConstraintType.RELAXED,
            message=f"实际: {sulfur_in_furnace:.3f} t/h"
        ))
        
        low_heat_ratio = low_heat_total / total_val
        if request.enable_refund_constraint and strategy["refund_ratio"] > 0:
            constraints_status.append(ConstraintStatus(
                name="退税掺烧比例",
                required=strategy["refund_ratio"],
                actual=round(low_heat_ratio, 3),
                status=ConstraintType.STRICT if low_heat_ratio >= strategy["refund_ratio"] else ConstraintType.VIOLATED,
                message=f"低热值煤占比: {low_heat_ratio:.1%}"
            ))
        
        constraints_status.append(ConstraintStatus(
            name="加权热值",
            required=min_heat,
            actual=round(actual_heat, 0),
            status=ConstraintType.STRICT if min_heat <= actual_heat <= max_heat else ConstraintType.VIOLATED,
            message=f"加权热值: {actual_heat:.0f} kcal/kg"
        ))
        
        boiler_eff = self._calculate_boiler_efficiency(actual_heat, actual_ash)
        coal_consumption = self._calculate_coal_consumption(actual_heat, boiler_eff)
        
        byproducts = self._calculate_byproducts(total_val, actual_ash, actual_sulfur, pulp.value(coal_cost), request.target_power)
        
        boiler_result = BoilerResult(
            efficiency=round(boiler_eff, 2),
            turbine_heat_rate=8025,
            coal_consumption=round(coal_consumption, 2),
            heat_loss_q2=0,
            heat_loss_q3=0,
            heat_loss_q4=0,
            heat_loss_q5=0.586,
            heat_loss_q6=0
        )
        
        return OptimizationResult(
            status="optimal",
            profit=round(pulp.value(prob.objective), 2),
            total_cost=round(pulp.value(coal_cost), 2),
            total_amount=round(total_val, 2),
            weighted_heat=round(actual_heat, 2),
            weighted_sulfur=round(actual_sulfur, 4),
            weighted_ash=round(actual_ash, 2),
            sulfur_in_furnace=round(sulfur_in_furnace, 3),
            tax_refund=round(pulp.value(refund), 2) if request.enable_refund_constraint else 0,
            low_heat_ratio=round(low_heat_ratio, 4),
            boiler=boiler_result,
            byproducts=byproducts,
            components=components,
            constraints=constraints_status,
            relaxation_log=[],
            calculation_time=0
        )
    
    def _calculate_boiler_efficiency(self, heat_value: float, ash: float) -> float:
        if heat_value <= 0:
            return 85.0
        base_eff = 90.0
        heat_factor = (heat_value - 3000) / 1000 * 1.5
        ash_factor = (ash - 30) / 10 * 0.5
        efficiency = base_eff + heat_factor - ash_factor
        return max(82, min(93, efficiency))
    
    def _calculate_coal_consumption(self, heat_value: float, efficiency: float) -> float:
        if efficiency <= 0 or heat_value <= 0:
            return 350
        standard_coal_heat = 7000
        heat_rate = standard_coal_heat / (efficiency / 100) * (standard_coal_heat / heat_value)
        coal_rate = 29307.6 / (efficiency / 100) / 29.3076
        return min(400, max(280, coal_rate))
    
    def _calculate_byproducts(self, total_coal: float, ash: float, sulfur: float, 
                              coal_cost: float, power: float) -> ByproductResult:
        bp = self.config.byproduct_params
        
        ash_ratio = bp.get("fly_ash_ratio", 0.9)
        slag_ratio = bp.get("slag_ratio", 0.1)
        
        ash_amount = total_coal * ash / 100 * ash_ratio
        ash_sales = ash_amount * bp.get("ash_sale_ratio", 0.4)
        ash_revenue = ash_sales * bp.get("ash_price", -20) / 10000
        
        slag_amount = total_coal * ash / 100 * slag_ratio
        slag_sales = slag_amount * bp.get("slag_sale_ratio", 0.45)
        slag_revenue = slag_sales * bp.get("slag_price", -8) / 10000
        
        ca_s_ratio = bp.get("gypsum_ca_s_ratio", 4.35)
        gypsum_amount = total_coal * sulfur / 100 * ca_s_ratio * 80 / 172
        gypsum_sales = gypsum_amount * bp.get("gypsum_sale_ratio", 0.38)
        gypsum_revenue = gypsum_sales * bp.get("gypsum_price", -5) / 10000
        
        limestone_ratio = bp.get("gypsum_limestone_ratio", 1.95)
        limestone_amount = gypsum_amount * limestone_ratio * 100 / 172
        limestone_cost = limestone_amount * bp.get("limestone_price", 67) / 10000
        
        urea_amount = power * 0.00001
        urea_cost = urea_amount * bp.get("urea_price", 2500) / 10000
        
        ash_transport = ash_amount * bp.get("ash_moist_ratio", 0.25) * bp.get("ash_transport_price", 7.9) / 10000
        slag_transport = slag_amount * bp.get("slag_moist_ratio", 0.25) * bp.get("slag_transport_price", 7.9) / 10000
        gypsum_transport = gypsum_amount * bp.get("gypsum_transport_price", 7.9) / 10000
        total_transport = ash_transport + slag_transport + gypsum_transport
        
        total_revenue = ash_revenue + slag_revenue + gypsum_revenue - limestone_cost - urea_cost - total_transport
        
        return ByproductResult(
            ash_amount=round(ash_amount, 4),
            ash_sales=round(ash_sales, 4),
            ash_revenue=round(ash_revenue, 2),
            slag_amount=round(slag_amount, 4),
            slag_sales=round(slag_sales, 4),
            slag_revenue=round(slag_revenue, 2),
            gypsum_amount=round(gypsum_amount, 4),
            gypsum_sales=round(gypsum_sales, 4),
            gypsum_revenue=round(gypsum_revenue, 2),
            limestone_cost=round(limestone_cost, 2),
            urea_cost=round(urea_cost, 2),
            transport_cost=round(total_transport, 2),
            total_byproduct_revenue=round(total_revenue, 2)
        )
    
    def _error_result(self, msg: str) -> OptimizationResult:
        return OptimizationResult(
            status="error", profit=0, total_cost=0, total_amount=0,
            weighted_heat=0, weighted_sulfur=0, weighted_ash=0,
            sulfur_in_furnace=0, tax_refund=0, low_heat_ratio=0,
            boiler=BoilerResult(),
            byproducts=ByproductResult(),
            components=[], constraints=[], 
            relaxation_log=[msg], calculation_time=0
        )
    
    def _infeasible_result(self, logs: List[str]) -> OptimizationResult:
        return OptimizationResult(
            status="infeasible", profit=0, total_cost=0, total_amount=0,
            weighted_heat=0, weighted_sulfur=0, weighted_ash=0,
            sulfur_in_furnace=0, tax_refund=0, low_heat_ratio=0,
            boiler=BoilerResult(),
            byproducts=ByproductResult(),
            components=[], constraints=[],
            relaxation_log=logs + ["所有松弛级别均失败"],
            calculation_time=0
        )
