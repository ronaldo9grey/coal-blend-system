import React from 'react';

const ConfigPanel = ({ config, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableRefund}
            onChange={(e) => onChange({ ...config, enableRefund: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">退税模式</span>
        </label>
        <span className="text-xs text-gray-400">低热值煤≥60%</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">目标发电量</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={config.targetPower}
              onChange={(e) => onChange({ ...config, targetPower: Number(e.target.value) })}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-400">万度</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">优化目标</label>
          <select
            value={config.priority}
            onChange={(e) => onChange({ ...config, priority: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="profit">利润最大</option>
            <option value="eco">环保优先</option>
            <option value="balanced">均衡方案</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
