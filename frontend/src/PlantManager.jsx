import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

const defaultParams = {
  turbine_heat_rate: 7715,
  pipe_efficiency: 0.99,
  heat_loss: 0.586,
  fly_ash_combustible: 1.21,
  slag_combustible: 1.0,
  fly_ash_ratio: 0.9,
  slag_ratio: 0.1,
  aux_power_rate: 0.061,
  electricity_price: 0.587,
  vat_rate: 0.13,
  refund_heat_threshold: 3000,
  refund_min_ratio: 0.6,
  refund_per_ton: 6.69,
  max_sulfur_in_furnace: 4.03,
  min_heat_value: 2629,
  max_heat_value: 4100,
  ash_price: -20,
  slag_price: -8,
  gypsum_price: -5,
  limestone_price: 67,
  transport_price: 7.9,
  urea_rate: 0.00001,
  urea_price: 2500
};

function PlantManager({ onClose, onSelectPlant }) {
  const [plants, setPlants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    is_default: false,
    params: { ...defaultParams }
  });

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    const res = await fetch(`${API_BASE}/plants`);
    const data = await res.json();
    setPlants(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await fetch(`${API_BASE}/plants/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_BASE}/plants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    }
    loadPlants();
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', is_default: false, params: { ...defaultParams } });
  };

  const handleEdit = (plant) => {
    setEditing(plant);
    setForm({
      name: plant.name,
      is_default: plant.is_default,
      params: { ...defaultParams, ...plant.params }
    });
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除此电厂?')) {
      await fetch(`${API_BASE}/plants/${id}`, { method: 'DELETE' });
      loadPlants();
    }
  };

  const updateParam = (key, value) => {
    setForm({
      ...form,
      params: { ...form.params, [key]: parseFloat(value) || 0 }
    });
  };

  const paramGroups = [
    { title: '机组参数', keys: ['turbine_heat_rate', 'pipe_efficiency', 'aux_power_rate'] },
    { title: '锅炉参数', keys: ['heat_loss', 'fly_ash_combustible', 'slag_combustible', 'fly_ash_ratio', 'slag_ratio'] },
    { title: '经济参数', keys: ['electricity_price', 'vat_rate'] },
    { title: '退税参数', keys: ['refund_heat_threshold', 'refund_min_ratio', 'refund_per_ton'] },
    { title: '约束参数', keys: ['max_sulfur_in_furnace', 'min_heat_value', 'max_heat_value'] },
    { title: '副产物参数', keys: ['ash_price', 'slag_price', 'gypsum_price', 'limestone_price', 'transport_price'] },
    { title: '其他参数', keys: ['urea_rate', 'urea_price'] }
  ];

  const paramLabels = {
    turbine_heat_rate: '汽机热耗',
    pipe_efficiency: '管道效率',
    heat_loss: '散热损失(%)',
    fly_ash_combustible: '飞灰可燃物(%)',
    slag_combustible: '炉渣可燃物(%)',
    fly_ash_ratio: '飞灰占比',
    slag_ratio: '炉渣占比',
    aux_power_rate: '厂用电率(%)',
    electricity_price: '上网电价(元/kWh)',
    vat_rate: '增值税率(%)',
    refund_heat_threshold: '退税热值阈值',
    refund_min_ratio: '退税最低比例(%)',
    refund_per_ton: '退税金额(万/万吨)',
    max_sulfur_in_furnace: '最大入炉硫量',
    min_heat_value: '最小热值',
    max_heat_value: '最大热值',
    ash_price: '炉灰价格(元/吨)',
    slag_price: '炉渣价格(元/吨)',
    gypsum_price: '石膏价格(元/吨)',
    limestone_price: '石粉价格(元/吨)',
    transport_price: '倒运价格(元/吨)',
    urea_rate: '尿素耗率',
    urea_price: '尿素价格(元/吨)'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">电厂信息管理</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">添加/编辑电厂</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">电厂名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={e => setForm({...form, is_default: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">默认</span>
                  </label>
                </div>
              </div>

              {paramGroups.map(group => (
                <div key={group.title} className="border border-gray-100 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">{group.title}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {group.keys.map(key => (
                      <div key={key}>
                        <label className="block text-xs text-gray-500 mb-0.5">{paramLabels[key]}</label>
                        <input
                          type="number"
                          step="any"
                          value={form.params[key]}
                          onChange={e => updateParam(key, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editing ? '更新' : '添加'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">电厂列表 ({plants.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {plants.map(plant => (
                <div
                  key={plant.id}
                  className="p-3 rounded-xl border-2 border-gray-100 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{plant.name}</span>
                        {plant.is_default && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">默认</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {onSelectPlant && (
                        <button
                          onClick={() => { onSelectPlant(plant); onClose(); }}
                          className="p-1.5 text-green-500 hover:bg-green-50 rounded"
                          title="选择此电厂"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(plant)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(plant.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantManager;
