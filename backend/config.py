from pydantic import BaseModel
from typing import Optional

class PlantConfig(BaseModel):
    """电厂配置"""
    name: str = "百矿"
    
    enable_tax_refund: bool = True          # 是否启用退税约束
    refund_heat_threshold: float = 3000     # 退税热值门槛 kcal/kg
    refund_min_ratio: float = 0.60          # 最低掺烧比例
    refund_rate: float = 0.50               # 退税比例
    
    max_sulfur_in_furnace: float = 4.03     # t/h 入炉硫量上限
    max_heat_value: float = 4100             # 最高热值 kcal/kg
    min_heat_value: float = 2629             # 最低热值 kcal/kg
    
    operating_hours: float = 1224            # 月运行小时数
    vat_rate: float = 0.13               # 增值税率
    
    target_power: float = 42169.72       # 目标发电量 万度
    
    boiler_params: dict = {
        "rated_evaporation": 420,        # 额定蒸发量 t/h
        "fly_ash_ratio": 0.9,            # 飞灰占比
        "slag_ratio": 0.1,             # 炉渣占比
        "fly_ash_combustible": 1.21,    # 飞灰可燃物 %
        "slag_combustible": 1.0,       # 炉渣可燃物 %
        "heat_loss": 0.586257,        # 散热损失 %
        "turbine_heat_rate": 7715,    # 汽机热耗 kJ/kWh
        "pipe_efficiency": 0.99,      # 管道效率
    }
    
    byproduct_params: dict = {
        "ash_sale_ratio": 0.40,          # 炉灰销售比例
        "ash_price": -20,               # 炉灰价格 元/吨
        "slag_sale_ratio": 0.45,         # 炉渣销售比例
        "slag_price": -8,                # 炉渣价格 元/吨
        "gypsum_ca_s_ratio": 4.35,      # 钙硫比
        "gypsum_gypsum_ratio": 1.95,    # 石膏石粉比
        "gypsum_sale_ratio": 0.38,      # 石膏销售比例
        "gypsum_price": -5,             # 石膏价格 元/吨
        "limestone_price": 67,           # 石粉价格 元/吨
        "urea_price": 2500,             # 尿素价格 元/吨
        "ash_transport_price": 7.9,      # 炉灰倒运单价
        "slag_transport_price": 7.9,     # 炉渣倒运单价
        "gypsum_transport_price": 7.9,   # 石膏倒运单价
        "ash_moist_ratio": 0.25,        # 炉灰调湿比例
        "slag_moist_ratio": 0.25,       # 炉渣调湿比例
    }

DEFAULT_CONFIG = PlantConfig()
