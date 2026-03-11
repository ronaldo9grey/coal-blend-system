import React, { useState, useEffect } from 'react';
import { getHistory, getHistoryDetail, deleteHistory } from './api';

function HistoryPanel({ onClose, onLoadResult }) {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleView = async (id) => {
    const detail = await getHistoryDetail(id);
    setSelected(detail);
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除此记录?')) {
      await deleteHistory(id);
      loadHistory();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', { 
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">历史记录</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-80px)]">
          <div className="lg:col-span-1 border-r border-gray-100 overflow-y-auto p-4">
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <div>暂无历史记录</div>
                </div>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleView(item.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selected?.id === item.id 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        ¥{item.profit?.toFixed(0)}万
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      发电{item.target_power?.toFixed(0)}万度 · {item.total_amount?.toFixed(1)}万吨
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 overflow-y-auto p-4">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">优化详情</h3>
                  <button
                    onClick={() => onLoadResult(selected)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:shadow-lg transition-all"
                  >
                    加载此方案
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3">
                    <div className="text-xs text-emerald-600">利润</div>
                    <div className="text-xl font-bold text-emerald-600">{selected.profit?.toFixed(0)}万</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
                    <div className="text-xs text-blue-600">退税</div>
                    <div className="text-xl font-bold text-blue-600">{selected.tax_refund?.toFixed(0)}万</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
                    <div className="text-xs text-purple-600">锅炉效率</div>
                    <div className="text-xl font-bold text-purple-600">{selected.boiler_efficiency?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3">
                    <div className="text-xs text-orange-600">标煤耗</div>
                    <div className="text-xl font-bold text-orange-600">{selected.coal_consumption?.toFixed(0)}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-700 mb-3">配煤方案</h4>
                  <div className="space-y-2">
                    {JSON.parse(selected.components || '[]').map((comp, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {comp.percentage?.toFixed(0)}%
                          </div>
                          <span className="font-medium text-gray-700">{comp.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {comp.amount?.toFixed(2)}万吨 · ¥{comp.cost?.toFixed(0)}万
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500">总煤量</div>
                    <div className="font-semibold text-gray-700">{selected.total_amount?.toFixed(2)}万吨</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500">加权热值</div>
                    <div className="font-semibold text-gray-700">{selected.weighted_heat?.toFixed(0)} kcal</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500">低热值占比</div>
                    <div className="font-semibold text-gray-700">{(selected.low_heat_ratio * 100)?.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm"
                  >
                    删除此记录
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">👈</div>
                  <div>选择左侧记录查看详情</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;
