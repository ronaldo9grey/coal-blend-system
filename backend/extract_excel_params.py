# -*- coding: utf-8 -*-
"""
Excel模型参数提取
"""

import pandas as pd

xlsx = pd.ExcelFile(r'f:\myPro\coal_blend_system\测试模型用2025.12.5.xlsx')
df = pd.read_excel(xlsx, sheet_name=0, header=None)

print("=" * 70)
print("Excel模型完整参数提取")
print("=" * 70)

# 基本参数
power = df.iloc[27, 0]
aux_rate = df.iloc[29, 0]
coal_rate = df.iloc[31, 0]
boiler_eff = df.iloc[13, 0]
turbine_heat_rate = df.iloc[15, 0]

print(f"\n【基本运行参数】")
print(f"发电量: {power} 万度")
print(f"综合厂用电率: {aux_rate}%")
print(f"发电标煤耗: {coal_rate} g/kWh")
print(f"锅炉效率: {boiler_eff}%")
print(f"汽机热耗率: {turbine_heat_rate} kJ/kWh")

# 加权平均
weighted_heat = df.iloc[17, 2]
weighted_sulfur = df.iloc[17, 7]
weighted_ash = df.iloc[17, 6]

print(f"\n【加权平均】")
print(f"加权热值: {weighted_heat} kcal/kg")
print(f"加权硫分: {weighted_sulfur}%")
print(f"加权灰分: {weighted_ash}%")

# 炉灰炉渣
ash_ratio = df.iloc[18, 2]
ash_amount = df.iloc[18, 4]
ash_sale_ratio = df.iloc[18, 6]
slag_ratio = df.iloc[19, 2]
slag_amount = df.iloc[19, 4]
slag_sale_ratio = df.iloc[19, 6]

print(f"\n【炉灰炉渣】")
print(f"炉灰占比: {ash_ratio}%")
print(f"炉灰产量: {ash_amount} 万吨")
print(f"炉灰销售比例: {ash_sale_ratio}%")
print(f"炉渣占比: {slag_ratio}%")
print(f"炉渣产量: {slag_amount} 万吨")
print(f"炉渣销售比例: {slag_sale_ratio}%")

# 石膏
ca_s_ratio = df.iloc[20, 2]
gypsum_amount = df.iloc[20, 4]
gypsum_sale_ratio = df.iloc[20, 6]
gypsum_limestone_ratio = df.iloc[21, 2]

print(f"\n【石膏】")
print(f"钙硫比: {ca_s_ratio}")
print(f"石膏产量: {gypsum_amount} 万吨")
print(f"石膏销售比例: {gypsum_sale_ratio}%")
print(f"石膏石粉比: {gypsum_limestone_ratio}")

# 蒸汽
steam_amount = df.iloc[21, 4]
steam_price = df.iloc[22, 4]
steam_revenue = df.iloc[23, 4]
tax_rate = df.iloc[24, 4]

print(f"\n【蒸汽】")
print(f"销售蒸汽: {steam_amount} 万吨")
print(f"蒸汽单价: {steam_price} 元/吨")
print(f"蒸汽收入: {steam_revenue} 万元")
print(f"税率: {tax_rate}%")

# 利润
profit = df.iloc[12, 0]

print(f"\n【利润】")
print(f"利润: {profit} 万元")

# 配煤方案
print(f"\n【Excel配煤方案】")
for i in range(2, 15):
    name = df.iloc[i, 1]
    ratio = df.iloc[i, 9]
    planned = df.iloc[i, 10]
    available = df.iloc[i, 11]
    if pd.notna(ratio) and ratio > 0:
        print(f"  {name}: {ratio:.2f}% = {planned:.2f}万吨 (可用: {available:.2f}万吨)")
