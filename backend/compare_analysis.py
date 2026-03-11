# Excel模型 vs 项目求解器对比分析

import pandas as pd

# 读取Excel模型
xlsx = pd.ExcelFile(r'f:\myPro\coal_blend_system\测试模型用2025.12.5.xlsx')
df = pd.read_excel(xlsx, sheet_name=0, header=None)

print("=" * 70)
print("Excel模型关键参数")
print("=" * 70)

# 从Excel提取数据
excel_power = 38174.13  # 发电量 万度
excel_coal_rate = 299.16  # 发电标煤耗 g/kWh
excel_profit = 5540.32  # 利润 万元
excel_heat = 2715.09  # 加权热值 kcal/kg

print(f"发电量: {excel_power:.2f} 万度")
print(f"发电标煤耗: {excel_coal_rate:.2f} g/kWh")
print(f"利润: {excel_profit:.2f} 万元")
print(f"加权热值: {excel_heat:.0f} kcal/kg")

# 计算所需标煤量
required_standard_coal = excel_power * 10000 * excel_coal_rate / 1000000
print(f"\n所需标煤量: {required_standard_coal:.2f} 万吨")

# 如果热值是2715，需要多少原煤
required_raw_coal = required_standard_coal * 7000 / excel_heat
print(f"所需原煤量(热值{excel_heat:.0f}): {required_raw_coal:.2f} 万吨")

print("\n" + "=" * 70)
print("偏差原因分析")
print("=" * 70)

print("""
关键发现:
1. Excel模型发电量是 38174 万度，不是 42169 万度
2. Excel发电标煤耗是 299 g/kWh，不是 312 g/kWh
3. Excel加权热值是 2715 kcal/kg，不是 2629 kcal/kg

这说明:
- Excel模型优化的是不同的发电量目标
- 我们使用了错误的发电量参数(42169 vs 38174)
- 这导致了配煤方案的差异
""")

# 使用正确参数重新计算
print("\n" + "=" * 70)
print("使用Excel参数重新测试")
print("=" * 70)

from solver_core import CoalBlendSolver
from models import OptimizationRequest

solver = CoalBlendSolver()
request = OptimizationRequest(
    target_power=38174.13,  # 使用Excel的发电量
    selected_coals=[1, 2, 11],
    enable_refund_constraint=True,
    priority='profit'
)
result = solver.solve(request)

print(f"\n项目求解器结果 (发电量={excel_power:.0f}万度):")
print(f"状态: {result.status}")
print(f"利润: {result.profit:.2f} 万元 (Excel: {excel_profit:.2f})")
print(f"总煤量: {result.total_amount:.2f} 万吨")
print(f"加权热值: {result.weighted_heat:.0f} kcal/kg (Excel: {excel_heat:.0f})")
print(f"低热值煤占比: {result.low_heat_ratio*100:.1f}%")
print("配煤方案:")
for c in result.components:
    print(f"  {c.name}: {c.amount:.2f}万吨 ({c.percentage:.1f}%)")
