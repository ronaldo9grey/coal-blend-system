import React from 'react';

const ResultPanel = ({ result }) => {
  if (!result) return null;
  
  const statusConfig = {
    optimal: { color: 'from-green-400 to-emerald-500', bg: 'bg-gradient-to-r from-green-50 to-emerald-50', icon: '✓' },
    relaxed: { color: 'from-amber-400 to-orange-500', bg: 'bg-gradient-to-r from-amber-50 to-orange-50', icon: '⚠' },
    infeasible: { color: 'from-red-400 to-rose-500', bg: 'bg-gradient-to-r from-red-50 to-rose-50', icon: '✗' },
    error: { color: 'from-gray-400 to-gray-500', bg: 'bg-gradient-to-r from-gray-50 to-gray-50', icon: '❌' }
  };

  const status = statusConfig[result.status] || statusConfig.error;
  const boiler = result.boiler || {};
  const byproducts = result.byproducts || {};

  const formatNumber = (num, decimals = 1) => {
    if (num === null || num === undefined) return '--';
    return Number(num).toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${status.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
            {status.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">优化结果</h2>
            <p className="text-sm text-gray-500">
              {result.status === 'optimal' ? '已找到最优配煤方案' : 
               result.status === 'relaxed' ? '约束已松弛求解' : '无可行解'}
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${status.bg.replace('50', '100')}`}>
          {result.status === 'optimal' ? '最优解' : 
           result.status === 'relaxed' ? '已松弛' : '无解'}
        </span>
      </div>

      {result.relaxation_log?.length > 0 && (
        <div className="bg-amber-50/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-2">
            <span className="text-amber-600">💡</span>
            <span className="text-sm font-medium text-amber-800">约束调整记录</span>
          </div>
          <div className="mt-2 space-y-1">
            {result.relaxation_log.slice(0, 3).map((log, i) => (
              <div key={i} className="text-xs text-amber-700 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-600">预计利润</span>
            <span className="text-xs text-emerald-500">💰</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-emerald-600">
              {formatNumber(result.profit, 0)}
            </span>
            <span className="text-sm text-emerald-500">万元</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600">退税金额</span>
            <span className="text-xs text-blue-500">🏷</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-blue-600">
              {formatNumber(result.tax_refund, 0)}
            </span>
            <span className="text-sm text-blue-500">万元</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-600">锅炉效率</span>
            <span className="text-xs text-purple-500">🔥</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-purple-600">
              {formatNumber(boiler.efficiency, 1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-600">标煤耗</span>
            <span className="text-xs text-orange-500">⚡</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-orange-600">
              {formatNumber(boiler.coal_consumption, 0)}
            </span>
            <span className="text-sm text-orange-500">g/kWh</span>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm">📊</span>
          <span>配煤方案</span>
          <span className="ml-auto text-sm font-normal text-gray-400">{result.components.length} 种煤</span>
        </h3>
        
        <div className="space-y-3">
          {result.components.map((comp, index) => {
            const percentage = comp.percentage;
            const barColor = percentage > 40 ? 'from-emerald-400 to-green-500' : 
                            percentage > 20 ? 'from-blue-400 to-indigo-500' : 
                            'from-purple-400 to-pink-500';
            
            return (
              <div 
                key={comp.coal_id}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${barColor} opacity-10`}></div>
                <div className="relative p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${barColor} flex items-center justify-center text-white shadow-lg`}>
                      <span className="text-xl font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-lg">{comp.name}</span>
                      <span className="px-2 py-0.5 bg-white/80 rounded-full text-xs text-gray-500">
                        {comp.coal_id}
                      </span>
                    </div>
                    
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-gray-600">{formatNumber(comp.amount, 2)}</span>
                        <span className="text-gray-400">万吨</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600">¥{formatNumber(comp.cost, 0)}</span>
                        <span className="text-gray-400">万</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(comp.amount, 2)}</div>
                    <div className="text-xs text-gray-400">万吨</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
          <div className="text-xs text-cyan-600 mb-1">低热值煤占比</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${result.low_heat_ratio >= 0.6 ? 'text-green-600' : 'text-red-500'}`}>
              {formatNumber(result.low_heat_ratio * 100, 1)}%
            </span>
            {result.low_heat_ratio < 0.6 && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">未达标</span>
            )}
          </div>
          <div className="text-xs text-gray-400">要求 ≥ 60%</div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
          <div className="text-xs text-violet-600 mb-1">入炉硫量</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${result.sulfur_in_furnace <= 4.03 ? 'text-green-600' : 'text-red-500'}`}>
              {formatNumber(result.sulfur_in_furnace, 3)}
            </span>
            <span className="text-sm text-gray-500">t/h</span>
          </div>
          <div className="text-xs text-gray-400">限制 ≤ 4.03 t/h</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
          <div className="text-xs text-amber-600 mb-1">总煤量</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-700">{formatNumber(result.total_amount, 2)}</span>
            <span className="text-sm text-gray-500">万吨</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
          <div className="text-xs text-rose-600 mb-1">加权热值</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-700">{formatNumber(result.weighted_heat, 0)}</span>
            <span className="text-sm text-gray-500">kcal/kg</span>
          </div>
        </div>
      </div>

      {byproducts && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm">♻️</span>
            <span>副产物收益</span>
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">炉灰产量</div>
              <div className="text-lg font-semibold text-gray-700">{formatNumber(byproducts.ash_amount, 3)}</div>
              <div className="text-xs text-gray-400">万吨</div>
            </div>
            
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">炉渣产量</div>
              <div className="text-lg font-semibold text-gray-700">{formatNumber(byproducts.slag_amount, 3)}</div>
              <div className="text-xs text-gray-400">万吨</div>
            </div>
            
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">石膏产量</div>
              <div className="text-lg font-semibold text-gray-700">{formatNumber(byproducts.gypsum_amount, 3)}</div>
              <div className="text-xs text-gray-400">万吨</div>
            </div>
            
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">净收益</div>
              <div className={`text-lg font-semibold ${byproducts.total_byproduct_revenue >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatNumber(byproducts.total_byproduct_revenue, 1)}
              </div>
              <div className="text-xs text-gray-400">万元</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span>⏱</span>
          <span>计算耗时: {formatNumber(result.calculation_time, 0)} ms</span>
        </div>
        <div className="text-xs">
          约束状态: {result.constraints?.length || 0} 项
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;
