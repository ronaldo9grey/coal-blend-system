# 智能配煤优化系统

基于线性规划的配煤优化系统，支持退税约束、副产物收益计算、历史记录管理。

## 功能特点

- **完整利润计算模型**：发电收入、煤炭成本、退税收益、副产物收益
- **约束条件**：退税约束（低热值煤≥60%）、环保约束（入炉硫量≤4.03t/h）、热值范围
- **煤种管理**：支持添加、编辑、删除煤种
- **历史记录**：保存优化结果，支持查看历史方案
- **计算过程详解**：完整展示计算公式和代入过程

## 技术栈

- **后端**：FastAPI + PuLP (线性规划求解器) + SQLite
- **前端**：React + Tailwind CSS

## 快速开始

### 后端启动

```bash
cd backend
pip install -r requirements.txt
python main.py
```

后端服务运行在 http://localhost:8000

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:3000

## 项目结构

```
coal_blend_system/
├── backend/
│   ├── main.py           # FastAPI入口
│   ├── solver_core.py    # 线性规划求解器
│   ├── models.py         # 数据模型
│   ├── database.py       # SQLite数据库
│   ├── coal_database.py  # 煤种数据
│   └── config.py         # 配置参数
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ResultPanel.jsx
│   │   ├── CalculationProcess.jsx
│   │   └── ...
│   └── package.json
└── README.md
```

## 计算公式

### 利润计算
```
利润 = 发电收入 - 煤炭成本 + 退税收益 + 副产物净收益
```

### 发电收入
```
发电收入 = 发电量 × (1-厂用电率) × 电价 / (1+增值税率)
```

### 副产物计算
```
炉灰产量 = 总煤量 × 灰分% × 飞灰占比(90%)
炉渣产量 = 总煤量 × 灰分% × 炉渣占比(10%)
石膏产量 = 总煤量 × 硫分% × 钙硫比 × 80/172
```

## 许可证

MIT License
