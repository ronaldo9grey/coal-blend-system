import React from 'react';

function CalculationRules({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">计算规则说明</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100">
            <h3 className="font-semibold text-cyan-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center text-sm">1</span>
              配煤目标
            </h3>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">💰 利润最大</span>
                  <span className="text-xs text-green-500">默认推荐</span>
                </div>
                <p className="text-sm text-gray-600">目标函数: 最大化利润</p>
                <div className="bg-gray-50 rounded p-2 mt-2 font-mono text-xs">
                  目标 = 利润 = 发电收入 - 煤炭成本 + 退税收益 + 副产物净收益
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">🌿 环保优先</span>
                  <span className="text-xs text-blue-500">降低排放</span>
                </div>
                <p className="text-sm text-gray-600">目标函数: 利润 - 硫分惩罚</p>
                <div className="bg-gray-50 rounded p-2 mt-2 font-mono text-xs">
                  目标 = 利润 - 加权硫分 × 5000
                </div>
                <p className="text-xs text-gray-500 mt-1">大幅惩罚高硫煤，优先选择低硫煤种</p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">⚖️ 均衡方案</span>
                  <span className="text-xs text-purple-500">质量优先</span>
                </div>
                <p className="text-sm text-gray-600">目标函数: 利润 + 热值奖励</p>
                <div className="bg-gray-50 rounded p-2 mt-2 font-mono text-xs">
                  目标 = 利润 + 加权热值 × 0.1
                </div>
                <p className="text-xs text-gray-500 mt-1">奖励高热值煤，提升煤质质量</p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center text-sm">2</span>
              约束条件
            </h3>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">退税约束</span>
                  <span className="text-xs text-gray-500">环保政策</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">低热值煤（热值 &lt; 3000 kcal/kg）掺烧比例 ≥ 60%</p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">环保约束</span>
                  <span className="text-xs text-gray-500">排放限制</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">入炉硫量 ≤ 4.03 t/h</p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">热值范围</span>
                  <span className="text-xs text-gray-500">锅炉要求</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">2629 ~ 4100 kcal/kg</p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">发电需求</span>
                  <span className="text-xs text-gray-500">生产目标</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">根据目标发电量计算所需热值</p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm">3</span>
              收入计算
            </h3>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">发电收入</div>
                <div className="text-sm text-gray-600 font-mono bg-gray-50 rounded p-2">
                  发电收入 = 发电量 × (1 - 厂用电率) × 上网电价 / (1 + 增值税率)
                </div>
                <div className="text-xs text-gray-500 mt-1">厂用电率: 6.1% | 上网电价: 0.587元/kWh | 增值税率: 13%</div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">退税收益</div>
                <div className="text-sm text-gray-600 font-mono bg-gray-50 rounded p-2">
                  退税 = 低热值煤用量 × 6.69万元/万吨
                </div>
                <div className="text-xs text-gray-500 mt-1">满足退税条件时，增值税退税收益</div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
            <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm">4</span>
              副产物计算
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">🔥 炉灰</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• 产量 = 总煤量 × 灰分% × 飞灰占比(90%)</p>
                  <p>• 销量 = 产量 × 销售比例(40%)</p>
                  <p>• 收益 = 销量 × 价格(-20元/吨)</p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">🪨 炉渣</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• 产量 = 总煤量 × 灰分% × 炉渣占比(10%)</p>
                  <p>• 销量 = 产量 × 销售比例(45%)</p>
                  <p>• 收益 = 销量 × 价格(-8元/吨)</p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">🧱 石膏</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• 产量 = 总煤量 × 硫分% × 钙硫比(4.35) × 80/172</p>
                  <p>• 销量 = 产量 × 销售比例(38%)</p>
                  <p>• 收益 = 销量 × 价格(-5元/吨)</p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">⚙️ 脱硫成本</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• 石粉耗量 = 石膏产量 × 石膏石粉比(1.95) × 100/172</p>
                  <p>• 石粉成本 = 石粉耗量 × 67元/吨</p>
                  <p>• 尿素成本 = 发电量 × 0.00001 × 2500元/吨</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm">5</span>
              锅炉效率计算
            </h3>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">锅炉效率 = 100% - 各项热损失</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-500">排烟热损失 Q2</span>
                  <span className="text-gray-700">~0.9%</span>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-500">化学不完全燃烧 Q3</span>
                  <span className="text-gray-700">~0.1%</span>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-500">机械不完全燃烧 Q4</span>
                  <span className="text-gray-700">~0.5%</span>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-500">散热损失 Q5</span>
                  <span className="text-gray-700">~0.586%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">实际效率根据煤质动态计算，范围: 82% ~ 93%</p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
            <h3 className="font-semibold text-rose-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-sm">6</span>
              约束松弛机制
            </h3>
            <div className="space-y-2">
              {[
                { level: 0, name: '严格约束', sulfur: '1.0x', refund: '60%', heat: '±0' },
                { level: 1, name: '轻度松弛', sulfur: '1.1x', refund: '55%', heat: '+50' },
                { level: 2, name: '中度松弛', sulfur: '1.2x', refund: '50%', heat: '+100' },
                { level: 3, name: '激进模式', sulfur: '1.3x', refund: '无', heat: '+200' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 rounded-lg p-2">
                  <span className="w-6 h-6 rounded bg-rose-500 text-white text-xs flex items-center justify-center">{s.level}</span>
                  <span className="font-medium text-gray-700">{s.name}</span>
                  <span className="text-xs text-gray-500">硫分×{s.sulfur}</span>
                  <span className="text-xs text-gray-500">退税{s.refund}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CalculationRules;
