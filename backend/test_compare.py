from solver_core import CoalBlendSolver
from models import OptimizationRequest

solver = CoalBlendSolver()
request = OptimizationRequest(
    target_power=38174,
    selected_coals=[1, 2, 11],
    enable_refund_constraint=True,
    priority='profit'
)
result = solver.solve(request)

print('='*60)
print('项目求解器结果 vs Excel模型')
print('='*60)
print(f'状态: {result.status}')
print(f'利润: {result.profit:.2f} 万元')
print(f'总煤量: {result.total_amount:.2f} 万吨')
print(f'总成本: {result.total_cost:.2f} 万元')
print(f'加权热值: {result.weighted_heat:.0f} kcal/kg')
print(f'加权硫分: {result.weighted_sulfur:.4f}%')
print(f'锅炉效率: {result.boiler.efficiency:.1f}%')
print(f'低热值煤占比: {result.low_heat_ratio*100:.1f}%')
print(f'退税金额: {result.tax_refund:.2f} 万元')
print()
print('配煤方案:')
for c in result.components:
    print(f'  {c.name}: {c.amount:.2f}万吨 ({c.percentage:.1f}%)')
print()
print('副产物收益:')
bp = result.byproducts
print(f'  炉灰: {bp.ash_amount:.3f}万吨, 收益{bp.ash_revenue:.2f}万元')
print(f'  炉渣: {bp.slag_amount:.3f}万吨, 收益{bp.slag_revenue:.2f}万元')
print(f'  石膏: {bp.gypsum_amount:.3f}万吨, 收益{bp.gypsum_revenue:.2f}万元')
print(f'  石粉成本: {bp.limestone_cost:.2f}万元')
print(f'  尿素成本: {bp.urea_cost:.2f}万元')
print(f'  倒运费用: {bp.total_transport:.2f}万元')
print(f'  副产物净收益: {bp.total_byproduct_revenue:.2f}万元')
