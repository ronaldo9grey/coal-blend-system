import React from 'react';

function CalculationProcess({ result, config, onClose }) {
  if (!result) return null;

  const byproducts = result.byproducts || {};
  const boiler = result.boiler || {};
  const components = result.components || [];
  const totalAmount = result.total_amount;
  const weightedAsh = result.weighted_ash * 100 || 25;
  const weightedSulfur = result.weighted_sulfur * 100 || 1.5;

  const revenue = result.profit + result.total_cost - result.tax_refund - (byproducts.total_byproduct_revenue || 0);
  const targetPower = config?.targetPower || 38174;

  const steps = [
    {
      title: '第一步：输入参数',
      icon: '📥',
      color: 'from-cyan-500 to-blue-500',
      items: [
        { label: '目标发电量', value: `${targetPower} 万度` },
        { label: '选择煤种数量', value: `${components.length} 种` },
        { label: '退税模式', value: config?.enableRefund ? '✅ 启用' : '❌ 禁用', highlight: config?.enableRefund },
        { label: '优化目标', value: config?.priority === 'profit' ? '利润最大化' : '其他' }
      ]
    },
    {
      title: '第二步：约束条件检查',
      icon: '🔒',
      color: 'from-purple-500 to-pink-500',
      items: [
        { 
          label: '退税约束', 
          formula: '低热值煤占比 ≥ 60%',
          calculation: `实际占比 = ${(result.low_heat_ratio * 100).toFixed(1)}% ${result.low_heat_ratio >= 0.6 ? '✅ 达标' : '⚠️ 未达标'}`,
          value: `${(result.low_heat_ratio * 100).toFixed(1)}%`,
          status: result.low_heat_ratio >= 0.6 ? 'strict' : 'violated'
        },
        { 
          label: '环保约束', 
          formula: '入炉硫量 ≤ 4.03 t/h',
          calculation: `实际硫量 = ${result.sulfur_in_furnace.toFixed(3)} t/h ${result.sulfur_in_furnace <= 4.03 ? '✅ 达标' : '⚠️ 超标'}`,
          value: `${result.sulfur_in_furnace.toFixed(3)} t/h`,
          status: result.sulfur_in_furnace <= 4.03 ? 'strict' : 'violated'
        },
        { 
          label: '热值约束', 
          formula: '2629 kcal/kg ≤ 加权热值 ≤ 4100 kcal/kg',
          calculation: `实际热值 = ${result.weighted_heat.toFixed(0)} kcal/kg`,
          value: `${result.weighted_heat.toFixed(0)} kcal/kg`
        }
      ]
    },
    {
      title: '第三步：配煤方案计算',
      icon: '📦',
      color: 'from-emerald-500 to-teal-500',
      formula: '总煤量 = Σ(各煤种用量)',
      calculation: `${components.map(c => c.amount.toFixed(2)).join(' + ')} = ${totalAmount.toFixed(2)} 万吨`,
      items: [
        { label: '总煤量', value: `${totalAmount.toFixed(2)} 万吨`, highlight: true },
        ...components.map(c => ({
          label: `└ ${c.name}`,
          value: `${c.amount.toFixed(2)} 万吨 (${c.percentage.toFixed(1)}%)`,
          sub: true
        }))
      ]
    },
    {
      title: '第四步：加权参数计算',
      icon: '📊',
      color: 'from-orange-500 to-amber-500',
      items: [
        { 
          label: '加权热值', 
          formula: '加权热值 = Σ(煤种用量 × 热值) ÷ 总煤量',
          calculation: `(${components.map(c => `${c.amount.toFixed(2)}×${c.heat_value || 3000}`).join(' + ')}) ÷ ${totalAmount.toFixed(2)} = ${result.weighted_heat.toFixed(0)} kcal/kg`,
          value: `${result.weighted_heat.toFixed(0)} kcal/kg`
        },
        { 
          label: '加权硫分', 
          formula: '加权硫分 = Σ(煤种用量 × 硫分) ÷ 总煤量',
          calculation: `加权硫分计算结果 = ${weightedSulfur.toFixed(2)}%`,
          value: `${weightedSulfur.toFixed(2)}%`
        },
        { 
          label: '加权灰分', 
          formula: '加权灰分 = Σ(煤种用量 × 灰分) ÷ 总煤量',
          calculation: `加权灰分计算结果 = ${weightedAsh.toFixed(1)}%`,
          value: `${weightedAsh.toFixed(1)}%`
        }
      ]
    },
    {
      title: '第五步：锅炉效率计算',
      icon: '🔥',
      color: 'from-red-500 to-rose-500',
      formula: '锅炉效率 = 100% - Q2(排烟) - Q3(化学) - Q4(机械) - Q5(散热) - Q6(灰渣)',
      calculation: `100% - 0.9% - 0.1% - 0.5% - 0.586% - 0.5% = ${boiler.efficiency?.toFixed(1) || 88}%`,
      items: [
        { label: '锅炉效率', value: `${boiler.efficiency?.toFixed(1) || 88}%`, highlight: true },
        { label: '发电标煤耗', value: `${boiler.coal_consumption?.toFixed(0) || 310} g/kWh` }
      ]
    },
    {
      title: '第六步：副产物计算',
      icon: '♻️',
      color: 'from-teal-500 to-cyan-500',
      items: [
        { 
          label: '炉灰产量', 
          formula: '炉灰产量 = 总煤量 × 灰分% × 飞灰占比(90%)',
          calculation: `${totalAmount.toFixed(2)} × ${weightedAsh.toFixed(1)}% × 90% = ${byproducts.ash_amount?.toFixed(3) || 0} 万吨`,
          value: `${byproducts.ash_amount?.toFixed(3) || 0} 万吨`
        },
        { 
          label: '炉渣产量', 
          formula: '炉渣产量 = 总煤量 × 灰分% × 炉渣占比(10%)',
          calculation: `${totalAmount.toFixed(2)} × ${weightedAsh.toFixed(1)}% × 10% = ${byproducts.slag_amount?.toFixed(3) || 0} 万吨`,
          value: `${byproducts.slag_amount?.toFixed(3) || 0} 万吨`
        },
        { 
          label: '石膏产量', 
          formula: '石膏产量 = 总煤量 × 硫分% × 钙硫比(4.35) × 80/172',
          calculation: `${totalAmount.toFixed(2)} × ${weightedSulfur.toFixed(2)}% × 4.35 × 80/172 = ${byproducts.gypsum_amount?.toFixed(3) || 0} 万吨`,
          value: `${byproducts.gypsum_amount?.toFixed(3) || 0} 万吨`
        },
        { 
          label: '副产物净收益', 
          formula: '净收益 = 炉灰收益 + 炉渣收益 + 石膏收益 - 脱硫成本 - 倒运费',
          calculation: `各项副产物收益合计 = ${byproducts.total_byproduct_revenue?.toFixed(2) || 0} 万元`,
          value: `${byproducts.total_byproduct_revenue?.toFixed(2) || 0} 万元`,
          highlight: true
        }
      ]
    },
    {
      title: '第七步：利润计算',
      icon: '💰',
      color: 'from-green-500 to-emerald-500',
      formula: '利润 = 发电收入 - 煤炭成本 + 退税收益 + 副产物净收益',
      items: [
        { 
          label: '发电收入', 
          formula: '发电收入 = 发电量 × (1-厂用电率) × 电价 ÷ (1+增值税率)',
          calculation: `${targetPower} × (1-6.1%) × 0.587 ÷ (1+13%) = ${revenue.toFixed(0)} 万元`,
          value: `${revenue.toFixed(0)} 万元`
        },
        { 
          label: '煤炭成本', 
          formula: '煤炭成本 = Σ(煤种用量 × 单价)',
          calculation: components.length > 0 
            ? `${components.map(c => `${c.amount.toFixed(2)}×${c.price}`).join(' + ')} = ${result.total_cost.toFixed(0)} 万元`
            : `各煤种成本合计 = ${result.total_cost.toFixed(0)} 万元`,
          value: `- ${result.total_cost.toFixed(0)} 万元`,
          negative: true
        },
        { 
          label: '退税收益', 
          formula: '退税收益 = 低热值煤用量 × 6.69万元/万吨',
          calculation: config?.enableRefund 
            ? `低热值煤用量 × 6.69 = ${result.tax_refund.toFixed(0)} 万元`
            : '退税模式未启用，退税收益 = 0',
          value: `+ ${result.tax_refund.toFixed(0)} 万元`,
          positive: true
        },
        { 
          label: '副产物净收益', 
          formula: '副产物净收益 = 炉灰+炉渣+石膏收益 - 脱硫成本 - 倒运费',
          calculation: `副产物净收益 = ${byproducts.total_byproduct_revenue?.toFixed(2) || 0} 万元`,
          value: `${byproducts.total_byproduct_revenue >= 0 ? '+' : ''} ${byproducts.total_byproduct_revenue?.toFixed(2) || 0} 万元`,
          positive: byproducts.total_byproduct_revenue >= 0,
          negative: byproducts.total_byproduct_revenue < 0
        },
        { 
          label: '━━━━━━━━━━━━━━━━━━━━', 
          value: '━━━━━━━━━━━━━━',
          divider: true
        },
        { 
          label: '最终利润', 
          formula: '利润 = 发电收入 - 煤炭成本 + 退税收益 + 副产物净收益',
          calculation: `${revenue.toFixed(0)} - ${result.total_cost.toFixed(0)} + ${result.tax_refund.toFixed(0)} + (${byproducts.total_byproduct_revenue?.toFixed(2) || 0}) = ${result.profit.toFixed(0)} 万元`,
          value: `${result.profit.toFixed(0)} 万元`,
          highlight: true,
          large: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200/20 via-transparent to-purple-200/20 animate-pulse" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl text-gray-600 hover:bg-white/80 transition-all border border-white/50 flex items-center gap-2"
            >
              <span>←</span> 返回
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                计算过程详解
              </h1>
              <p className="text-sm text-gray-500 mt-1">以下展示完整的配煤优化计算过程</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            计算耗时: <span className="font-mono text-purple-600">{result.calculation_time?.toFixed(0) || 0} ms</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {steps.map((step, stepIndex) => (
            <div 
              key={stepIndex} 
              className={`bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg ${
                stepIndex === steps.length - 1 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-lg shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">{step.title}</h3>
              </div>
              
              {step.formula && (
                <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div className="text-xs text-purple-500 mb-1 font-medium">📐 计算公式:</div>
                  <div className="text-sm font-mono text-purple-800">{step.formula}</div>
                </div>
              )}
              
              {step.calculation && (
                <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-500 mb-1 font-medium">🔢 代入计算:</div>
                  <div className="text-sm font-mono text-blue-800 break-all">{step.calculation}</div>
                </div>
              )}
              
              <div className="space-y-2">
                {step.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className={`p-3 rounded-lg ${
                      item.divider ? 'border-t border-gray-200 mt-2 pt-2' :
                      item.highlight 
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200' 
                        : item.sub
                          ? 'bg-gray-50/50 ml-3 text-sm'
                          : 'bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-sm font-medium ${item.sub ? 'text-gray-500' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          item.large ? 'text-xl text-emerald-600 font-bold' :
                          item.negative ? 'text-red-500' :
                          item.positive ? 'text-green-600' :
                          item.highlight ? 'text-emerald-600' :
                          'text-gray-800'
                        }`}>
                          {item.value}
                        </span>
                        {item.status && (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.status === 'strict' ? 'bg-green-100 text-green-700' :
                            item.status === 'relaxed' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.status === 'strict' ? '达标' : item.status === 'relaxed' ? '松弛' : '违规'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {item.formula && (
                      <div className="mt-2 p-2 bg-purple-50/50 rounded border border-purple-100">
                        <div className="text-xs text-purple-500 mb-0.5">📐 公式:</div>
                        <div className="text-xs font-mono text-purple-700">{item.formula}</div>
                      </div>
                    )}
                    
                    {item.calculation && (
                      <div className="mt-1.5 p-2 bg-blue-50/50 rounded border border-blue-100">
                        <div className="text-xs text-blue-500 mb-0.5">🔢 代入:</div>
                        <div className="text-xs font-mono text-blue-700 break-all">{item.calculation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            返回配煤结果
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalculationProcess;
