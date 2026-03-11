import React, { useState, useEffect } from 'react';
import ConfigPanel from './ConfigPanel';
import ResultPanel from './ResultPanel';
import CoalManager from './CoalManager';
import HistoryPanel from './HistoryPanel';
import CalculationRules from './CalculationRules';
import CalculationProcess from './CalculationProcess';
import { optimizeBlend, getCoals, saveResult } from './api';

function App() {
  const [coals, setCoals] = useState([]);
  const [config, setConfig] = useState({
    targetPower: 38174,
    selectedCoals: [],
    enableRefund: true,
    priority: 'profit'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCoalManager, setShowCoalManager] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCoals = async () => {
    const data = await getCoals();
    setCoals(data);
    const availableIds = data.filter(c => c.max_available > 0).map(c => c.id);
    setConfig(prev => ({
      ...prev,
      selectedCoals: availableIds
    }));
  };

  useEffect(() => {
    loadCoals();
  }, []);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const data = await optimizeBlend(config);
      setResult(data);
    } catch (error) {
      alert('优化失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveResult({
        target_power: config.targetPower,
        total_amount: result.total_amount,
        total_cost: result.total_cost,
        weighted_heat: result.weighted_heat,
        weighted_sulfur: result.weighted_sulfur,
        sulfur_in_furnace: result.sulfur_in_furnace,
        tax_refund: result.tax_refund,
        low_heat_ratio: result.low_heat_ratio,
        boiler_efficiency: result.boiler?.efficiency || 0,
        coal_consumption: result.boiler?.coal_consumption || 0,
        profit: result.profit,
        components: result.components,
        byproducts: result.byproducts,
        status: result.status
      });
      alert('保存成功!');
    } catch (error) {
      alert('保存失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadHistory = (historyItem) => {
    setResult({
      status: historyItem.status,
      profit: historyItem.profit,
      total_amount: historyItem.total_amount,
      total_cost: historyItem.total_cost,
      weighted_heat: historyItem.weighted_heat,
      weighted_sulfur: historyItem.weighted_sulfur,
      sulfur_in_furnace: historyItem.sulfur_in_furnace,
      tax_refund: historyItem.tax_refund,
      low_heat_ratio: historyItem.low_heat_ratio,
      boiler: {
        efficiency: historyItem.boiler_efficiency,
        coal_consumption: historyItem.coal_consumption
      },
      components: JSON.parse(historyItem.components || '[]'),
      byproducts: JSON.parse(historyItem.byproducts || '{}'),
      constraints: [],
      relaxation_log: [],
      calculation_time: 0
    });
    setShowHistory(false);
  };

  const toggleCoal = (coalId, maxAvailable) => {
    if (maxAvailable <= 0) return;
    const newSelected = config.selectedCoals.includes(coalId)
      ? config.selectedCoals.filter(id => id !== coalId)
      : [...config.selectedCoals, coalId];
    setConfig({ ...config, selectedCoals: newSelected });
  };

  const sortCoals = (coalList) => {
    return [...coalList].sort((a, b) => {
      if (a.max_available > 0 && b.max_available <= 0) return -1;
      if (a.max_available <= 0 && b.max_available > 0) return 1;
      return 0;
    });
  };

  const lowHeatCoals = sortCoals(coals.filter(c => c.qualifies_for_refund));
  const highHeatCoals = sortCoals(coals.filter(c => !c.qualifies_for_refund));

  if (showProcess && result) {
    return (
      <CalculationProcess 
        result={result} 
        config={config}
        onClose={() => setShowProcess(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200/20 via-transparent to-purple-200/20 animate-pulse" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                智能配煤优化系统
              </h1>
              <div className="h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full mt-1" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCoalManager(true)}
                className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg text-gray-600 hover:bg-white/80 transition-all border border-white/50 text-sm flex items-center gap-1"
              >
                <span>⚙️</span> 煤种管理
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg text-gray-600 hover:bg-white/80 transition-all border border-white/50 text-sm flex items-center gap-1"
              >
                <span>📋</span> 历史记录
              </button>
              <button
                onClick={() => setShowRules(true)}
                className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg text-gray-600 hover:bg-white/80 transition-all border border-white/50 text-sm flex items-center gap-1"
              >
                <span>📐</span> 计算规则
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400">v5.0</div>
        </header>
        
        <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/50 shadow-lg flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs">🎯</span>
                配煤目标
              </h3>
              <ConfigPanel config={config} onChange={setConfig} />
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/50 shadow-lg flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xs">🔥</span>
                煤种选择
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-emerald-600">低热值煤（可退税）</span>
                    <span className="text-xs text-gray-400">{lowHeatCoals.filter(c => c.max_available > 0).length}种可用</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {lowHeatCoals.map(coal => {
                      const isSelected = config.selectedCoals.includes(coal.id);
                      const hasStock = coal.max_available > 0;
                      return (
                        <div 
                          key={coal.id}
                          onClick={() => toggleCoal(coal.id, coal.max_available)}
                          className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            !hasStock 
                              ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                              : isSelected
                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-400 shadow-sm'
                                : 'bg-white/80 border border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-xs ${hasStock ? 'text-gray-800' : 'text-gray-400'}`}>
                              {coal.name}
                            </span>
                            {isSelected && hasStock && (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{coal.heat_value} kcal/kg</div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs font-semibold text-gray-700">¥{coal.price}</span>
                            <span className={`text-xs ${hasStock ? 'text-gray-400' : 'text-red-400'}`}>
                              {hasStock ? `${coal.max_available}万吨` : '无可用量'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600">高热值煤</span>
                    <span className="text-xs text-gray-400">{highHeatCoals.filter(c => c.max_available > 0).length}种可用</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {highHeatCoals.map(coal => {
                      const isSelected = config.selectedCoals.includes(coal.id);
                      const hasStock = coal.max_available > 0;
                      return (
                        <div 
                          key={coal.id}
                          onClick={() => toggleCoal(coal.id, coal.max_available)}
                          className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            !hasStock 
                              ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                              : isSelected
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-400 shadow-sm'
                                : 'bg-white/80 border border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-xs ${hasStock ? 'text-gray-800' : 'text-gray-400'}`}>
                              {coal.name}
                            </span>
                            {isSelected && hasStock && (
                              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{coal.heat_value} kcal/kg</div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs font-semibold text-gray-700">¥{coal.price}</span>
                            <span className={`text-xs ${hasStock ? 'text-gray-400' : 'text-red-400'}`}>
                              {hasStock ? `${coal.max_available}万吨` : '无可用量'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleOptimize}
                disabled={loading || config.selectedCoals.length === 0}
                className="w-full py-3 mt-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all text-sm flex-shrink-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    计算中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    开始优化
                  </span>
                )}
              </button>
              
              {config.selectedCoals.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-2 px-3 mt-2 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border border-purple-100 flex-shrink-0">
                  <span className="text-xs text-purple-700">已选</span>
                  <span className="px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs font-medium">
                    {config.selectedCoals.length} 种
                  </span>
                  {config.enableRefund && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">退税</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="col-span-8 flex flex-col overflow-hidden">
            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/50 shadow-lg flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs">📊</span>
                  配煤结果
                </h3>
                {result && (
                  <button
                    onClick={() => setShowProcess(true)}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-all flex items-center gap-1"
                  >
                    <span>⚙️</span> 计算过程
                  </button>
                )}
              </div>
              
              {result ? (
                <div className="space-y-4">
                  <ResultPanel result={result} />
                  
                  {result.status === 'optimal' && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          保存中...
                        </>
                      ) : (
                        <>
                          <span>💾</span> 保存此方案
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">准备就绪</h3>
                    <p className="text-gray-400 text-sm">选择煤种后点击"开始优化"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCoalManager && (
        <CoalManager onClose={() => { setShowCoalManager(false); loadCoals(); }} />
      )}

      {showHistory && (
        <HistoryPanel 
          onClose={() => setShowHistory(false)} 
          onLoadResult={handleLoadHistory}
        />
      )}

      {showRules && (
        <CalculationRules onClose={() => setShowRules(false)} />
      )}
    </div>
  );
}

export default App;
