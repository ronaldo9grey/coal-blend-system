# Intelligent Coal Blending Optimization System

A coal blending optimization system based on linear programming, supporting tax refund constraints, by-product revenue calculation, and historical record management.

## Features

- **Complete Profit Calculation Model**: Power generation revenue, coal cost, tax refund benefits, by-product revenue
- **Constraint Conditions**: Tax refund constraint (low calorific value coal ≥60%), environmental constraint (furnace sulfur ≤4.03t/h), calorific value range
- **Coal Type Management**: Add, edit, delete coal types
- **Historical Records**: Save optimization results, view historical solutions
- **Detailed Calculation Process**: Complete display of formulas and substitution calculations
- **SQLite Database**: Lightweight local storage
- **Holographic UI**: Modern holographic light-colored style interface

## Tech Stack

- **Backend**: FastAPI + PuLP (Linear Programming Solver) + SQLite
- **Frontend**: React + Tailwind CSS

## Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000

## Project Structure

```
coal_blend_system/
├── backend/
│   ├── main.py           # FastAPI entry point
│   ├── solver_core.py    # Linear programming solver
│   ├── models.py         # Data models
│   ├── database.py       # SQLite database
│   ├── coal_database.py  # Coal type data
│   └── config.py         # Configuration parameters
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ResultPanel.jsx
│   │   ├── CalculationProcess.jsx
│   │   └── ...
│   └── package.json
└── README.md
```

## Calculation Formulas

### Profit Calculation
```
Profit = Power Revenue - Coal Cost + Tax Refund + By-product Net Revenue
```

### Power Generation Revenue
```
Revenue = Power Generation × (1 - Auxiliary Power Rate) × Electricity Price / (1 + VAT Rate)
```

### By-product Calculation
```
Fly Ash Production = Total Coal × Ash % × Fly Ash Ratio (90%)
Slag Production = Total Coal × Ash % × Slag Ratio (10%)
Gypsum Production = Total Coal × Sulfur % × Ca/S Ratio × 80/172
```

## API Documentation

### Coal Management
- `GET /coals` - Get all coal types
- `POST /coals` - Create coal type
- `PUT /coals/{id}` - Update coal type
- `DELETE /coals/{id}` - Delete coal type

### Optimization
- `POST /optimize` - Run optimization
- `POST /history` - Save optimization result
- `GET /history` - Get history records

### Configuration
- `GET /config` - Get system configuration

## Constraint Relaxation Mechanism

| Level | Description | Sulfur Multiplier | Tax Refund Ratio |
|-------|-------------|-------------------|------------------|
| 0 | Strict | 1.0x | 60% |
| 1 | Mild | 1.1x | 55% |
| 2 | Moderate | 1.2x | 50% |
| 3 | Aggressive | 1.3x | None |

## License

MIT License
