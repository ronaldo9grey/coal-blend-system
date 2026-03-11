# 测试Excel模型约束验证
donghuai = 16.55  # 万吨
yuejin = 10.30    # 万吨
hemei46 = 7.05    # 万吨

total = donghuai + yuejin + hemei46
print(f'总煤量: {total:.2f} 万吨')

# 加权热值
heat = (donghuai * 2376.38 + yuejin * 1731.53 + hemei46 * 4600) / total
print(f'加权热值: {heat:.0f} kcal/kg')

# 加权硫分
sulfur = (donghuai * 1.5393 + yuejin * 0.4161 + hemei46 * 0.2081) / total
print(f'加权硫分: {sulfur:.4f}%')

# 入炉硫量
operating_hours = 1224
coal_flow = total * 10000 / operating_hours  # t/h
sulfur_flow = coal_flow * sulfur / 100
print(f'入炉煤量: {coal_flow:.1f} t/h')
print(f'入炉硫量: {sulfur_flow:.3f} t/h (限制4.03 t/h)')

# 低热值煤占比
low_heat_ratio = (donghuai + yuejin) / total
print(f'低热值煤占比: {low_heat_ratio*100:.1f}% (要求>=60%)')

# 检查约束
print('\n约束检查:')
print(f'  热值: 2629 <= {heat:.0f} <= 4100: {"OK" if 2629 <= heat <= 4100 else "FAIL"}')
print(f'  硫量: {sulfur_flow:.3f} <= 4.03: {"OK" if sulfur_flow <= 4.03 else "FAIL"}')
print(f'  退税: {low_heat_ratio*100:.1f}% >= 60%: {"OK" if low_heat_ratio >= 0.6 else "FAIL"}')

# 测试求解器
print('\n测试求解器...')
from solver_core import CoalBlendSolver
from models import OptimizationRequest

solver = CoalBlendSolver()
request = OptimizationRequest(
    target_power=42169.72,
    selected_coals=[1, 2, 11],
    enable_refund_constraint=True,
    priority='profit'
)
result = solver.solve(request)
print(f'状态: {result.status}')
print(f'利润: {result.profit:.2f} 万元')
print(f'总煤量: {result.total_amount:.2f} 万吨')
print(f'总成本: {result.total_cost:.2f} 万元')
print(f'加权热值: {result.weighted_heat:.0f} kcal/kg')
print(f'低热值煤占比: {result.low_heat_ratio*100:.1f}%')
print('配煤方案:')
for c in result.components:
    print(f'  {c.name}: {c.amount:.2f}万吨 ({c.percentage:.1f}%)')

print('\n松弛日志:')
for log in result.relaxation_log:
    print(f'  {log}')
