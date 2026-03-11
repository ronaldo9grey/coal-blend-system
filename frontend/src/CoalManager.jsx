import React, { useState } from 'react';
import { getCoals, createCoal, updateCoal, deleteCoal } from './api';

function CoalManager({ onClose }) {
  const [coals, setCoals] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', heat_value: 0, sulfur: 0, ash: 0, price: 0,
    max_available: 0, qualifies_for_refund: false
  });

  React.useEffect(() => {
    loadCoals();
  }, []);

  const loadCoals = async () => {
    const data = await getCoals();
    setCoals(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateCoal(editing.id, form);
    } else {
      await createCoal(form);
    }
    loadCoals();
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '', heat_value: 0, sulfur: 0, ash: 0, price: 0,
      max_available: 0, qualifies_for_refund: false
    });
  };

  const handleEdit = (coal) => {
    setEditing(coal);
    setForm(coal);
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除此煤种?')) {
      await deleteCoal(id);
      loadCoals();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">煤种管理</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">添加/编辑煤种</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">热值 (kcal/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.heat_value}
                    onChange={e => setForm({...form, heat_value: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">硫分 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sulfur}
                    onChange={e => setForm({...form, sulfur: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">灰分 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.ash}
                    onChange={e => setForm({...form, ash: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">价格 (元/吨)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">最大可用量 (万吨)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.max_available}
                    onChange={e => setForm({...form, max_available: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.qualifies_for_refund}
                      onChange={e => setForm({...form, qualifies_for_refund: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">可退税 (热值&lt;3000)</span>
                  </label>
                </div>
              </div>
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
            <h3 className="font-semibold text-gray-700">煤种列表 ({coals.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {coals.map(coal => (
                <div
                  key={coal.id}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    coal.qualifies_for_refund 
                      ? 'border-emerald-200 bg-emerald-50/50' 
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{coal.name}</span>
                        {coal.qualifies_for_refund && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">退税</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {coal.heat_value} kcal/kg · 硫{coal.sulfur}% · ¥{coal.price}/t
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(coal)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(coal.id)}
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

export default CoalManager;
