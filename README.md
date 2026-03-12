# Intelligent Coal Blending Optimization System

A coal blending optimization system based on linear programming, supporting tax refund constraints, by-product revenue calculation, power plant management, and historical record management.

## Features

- **Complete Profit Calculation Model**: Power generation revenue, coal cost, tax refund benefits, by-product revenue
- **Multiple Optimization Objectives**: Profit maximization, environmental priority, balanced solution
- **Constraint Conditions**: Tax refund constraint (low calorific value coal ≥60%), environmental constraint (furnace sulfur ≤4.03t/h), calorific value range
- **Power Plant Management**: Support multiple power plants with different parameters
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
│   │   ├── App.jsx       # Main application
│   │   ├── ResultPanel.jsx
│   │   ├── CalculationProcess.jsx
│   │   ├── PlantManager.jsx
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

### Standard Coal Consumption
```
Coal Rate = Turbine Heat Rate / (Boiler Efficiency × Pipe Efficiency) / Standard Coal Heat × 1000
```

### By-product Calculation
```
Fly Ash Production = Total Coal × Ash % × Fly Ash Ratio (90%)
Slag Production = Total Coal × Ash % × Slag Ratio (10%)
Gypsum Production = Total Coal × Sulfur % × Ca/S Ratio × 80/172
```

## Optimization Objectives

| Objective | Formula | Description |
|-----------|---------|-------------|
| 💰 Profit Maximization | `Profit` | Directly maximize profit |
| 🌿 Environmental Priority | `Profit - Weighted Sulfur × 5000` | Reduce sulfur emissions |
| ⚖️ Balanced Solution | `Profit + Weighted Heat × 0.1` | Improve coal quality |

## Constraint Relaxation Mechanism

| Level | Description | Sulfur Multiplier | Tax Refund Ratio |
|-------|-------------|-------------------|------------------|
| 0 | Strict | 1.0x | 60% |
| 1 | Mild | 1.1x | 55% |
| 2 | Moderate | 1.2x | 50% |
| 3 | Aggressive | 1.3x | None |

## Power Plant Parameters

| Parameter Type | Parameter Name | Description |
|---------------|----------------|-------------|
| **Unit Parameters** | Turbine Heat Rate | kJ/kWh, affects coal consumption |
| **Unit Parameters** | Pipe Efficiency | Usually 0.99 |
| **Boiler Parameters** | Heat Loss, Fly Ash Combustible, etc. | Affects boiler efficiency |
| **Economic Parameters** | Electricity Price, Auxiliary Power Rate | Affects revenue calculation |
| **Tax Refund Parameters** | Heat Value Threshold, Minimum Ratio, Refund Amount | Affects tax refund benefits |
| **Constraint Parameters** | Max Furnace Sulfur, Heat Value Range | Affects environmental compliance |
| **By-product Parameters** | Ash/Slag/Gypsum Price | Affects by-product revenue |

## API Documentation

### Power Plant Management
- `GET /plants` - Get all power plants
- `GET /plants/{id}` - Get power plant details
- `POST /plants` - Create power plant
- `PUT /plants/{id}` - Update power plant
- `DELETE /plants/{id}` - Delete power plant

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

## Version History

### v6.0.0 (Current)
- Added power plant management feature
- Added multiple optimization objectives
- Improved calculation precision (4 decimal places)
- Fixed coal cost display in calculation process
- Added plant name to history records

### v5.0.0
- Initial release with SQLite database
- Coal type management
- Historical records
- Complete profit calculation model

## License

MIT License
