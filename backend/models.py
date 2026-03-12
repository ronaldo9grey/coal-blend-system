from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from enum import Enum

class CoalType(BaseModel):
    id: int
    name: str
    heat_value: float           # kcal/kg 收到基低位发热量
    sulfur: float               # % 收到基硫分
    ash: float                  # % 收到基灰分
    price: float                # 元/吨（含税到厂价）
    max_available: float        # 万吨 最大可用量
    min_available: float = 0    # 万吨 最低用量
    moisture: float = 0         # % 收到基全水分
    volatile_matter: float = 0  # % 收到基挥发分
    qualifies_for_refund: bool = False  # 是否满足退税热值条件
    transport_cost: float = 0     # 元/吨 运费

class ConstraintType(str, Enum):
    STRICT = "strict"           # 严格约束
    RELAXED = "relaxed"         # 已松弛
    VIOLATED = "violated"       # 无法满足

class BlendComponent(BaseModel):
    coal_id: int
    name: str
    heat_value: float = 0
    sulfur: float = 0
    ash: float = 0
    price: float = 0
    amount: float              # 万吨
    percentage: float          # %
    cost: float                # 万元
    transport_cost: float = 0   # 万元运费

class ConstraintStatus(BaseModel):
    name: str                  # 约束名称
    required: float            # 要求值
    actual: float              # 实际值
    status: ConstraintType     # 状态
    message: str               # 说明

class ByproductResult(BaseModel):
    ash_ratio: float = 90            # 炉灰占比 %
    ash_amount: float = 0            # 炉灰产量（万吨）
    ash_sale_ratio: float = 40       # 炉灰销售比例 %
    ash_sales: float = 0             # 炉灰销量（万吨）
    ash_price: float = -20           # 炉灰价格 元/吨
    ash_revenue: float = 0           # 炉灰收入（万元）
    
    slag_ratio: float = 10           # 炉渣占比 %
    slag_amount: float = 0           # 炉渣产量（万吨）
    slag_sale_ratio: float = 45      # 炉渣销售比例 %
    slag_sales: float = 0            # 炉渣销量（万吨）
    slag_price: float = -8           # 炉渣价格 元/吨
    slag_revenue: float = 0          # 炉渣收入（万元）
    
    ca_s_ratio: float = 4.35         # 钙硫比
    gypsum_amount: float = 0         # 石膏产量（万吨）
    gypsum_sale_ratio: float = 38    # 石膏销售比例 %
    gypsum_sales: float = 0          # 石膏销量（万吨）
    gypsum_price: float = -5         # 石膏价格 元/吨
    gypsum_revenue: float = 0        # 石膏收入（万元）
    gypsum_limestone_ratio: float = 1.95  # 石膏石粉比
    
    limestone_amount: float = 0      # 石粉耗用（万吨）
    limestone_price: float = 67      # 石粉价格 元/吨
    limestone_cost: float = 0        # 石粉费用（万元）
    
    urea_amount: float = 0           # 尿素耗用（万吨）
    urea_price: float = 2500         # 尿素价格 元/吨
    urea_cost: float = 0             # 尿素费用（万元）
    
    ash_moist_ratio: float = 25      # 炉灰调湿比例 %
    slag_moist_ratio: float = 25     # 炉渣调湿比例 %
    transport_price: float = 7.9     # 倒运单价 元/吨
    ash_transport: float = 0         # 炉灰倒运费用（万元）
    slag_transport: float = 0        # 炉渣倒运费用（万元）
    gypsum_transport: float = 0      # 石膏倒运费用（万元）
    total_transport: float = 0       # 总倒运费用（万元）
    
    steam_amount: float = 0          # 销售蒸汽（万吨）
    steam_price: float = 168         # 蒸汽单价 元/吨
    steam_revenue: float = 0         # 蒸汽收入（万元）
    steam_tax_rate: float = 9        # 蒸汽税率 %
    steam_revenue_after_tax: float = 0  # 税后蒸汽收入（万元）
    
    total_byproduct_revenue: float = 0  # 副产物总收入

class BoilerResult(BaseModel):
    efficiency: float = 0           # 锅炉效率 %
    turbine_heat_rate: float = 8025  # 汽机热耗率 kJ/kWh
    coal_consumption: float = 0     # 发电标煤耗 g/kWh
    heat_loss_q2: float = 0         # 排烟热损失 %
    heat_loss_q3: float = 0         # 化学不完全燃烧热损失 %
    heat_loss_q4: float = 0         # 机械不完全燃烧热损失 %
    heat_loss_q5: float = 0.586     # 散热损失 %
    heat_loss_q6: float = 0         # 灰渣物理热损失 %

class OptimizationResult(BaseModel):
    status: Literal["optimal", "infeasible", "relaxed", "error"]
    profit: float
    total_cost: float
    total_amount: float
    weighted_heat: float
    weighted_sulfur: float
    weighted_ash: float
    sulfur_in_furnace: float
    tax_refund: float
    low_heat_ratio: float
    boiler: BoilerResult
    byproducts: ByproductResult
    components: List[BlendComponent]
    constraints: List[ConstraintStatus]
    relaxation_log: List[str]
    calculation_time: float

class OptimizationRequest(BaseModel):
    target_power: float = Field(38174, description="目标发电量（万度）")
    selected_coals: List[int] = Field([1, 2, 11], description="选择的煤种ID")
    constraints: Dict = Field(default_factory=dict)
    enable_refund_constraint: bool = Field(True, description="是否强制满足退税条件")
    priority: Literal["profit", "eco", "balanced"] = "profit"
