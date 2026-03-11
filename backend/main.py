from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from models import OptimizationRequest, OptimizationResult, CoalType
from solver_core import CoalBlendSolver
from config import DEFAULT_CONFIG
import database as db
import uvicorn

app = FastAPI(
    title="智能配煤优化系统 API v5.0",
    description="支持煤种管理、历史记录、SQLite数据库",
    version="5.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

solver = CoalBlendSolver()

@app.get("/")
async def root():
    return {
        "status": "running", 
        "version": "5.0.0", 
        "features": [
            "SQLite数据库",
            "煤种管理",
            "历史记录",
            "完整利润计算"
        ]
    }

@app.get("/coals")
async def get_coals():
    coals = db.get_all_coals()
    return coals

@app.post("/coals")
async def create_coal(coal: dict):
    return db.create_coal(coal)

@app.put("/coals/{coal_id}")
async def update_coal(coal_id: int, coal: dict):
    result = db.update_coal(coal_id, coal)
    if not result:
        raise HTTPException(status_code=404, detail="煤种不存在")
    return result

@app.delete("/coals/{coal_id}")
async def delete_coal(coal_id: int):
    db.delete_coal(coal_id)
    return {"status": "deleted"}

@app.post("/optimize", response_model=OptimizationResult)
async def optimize(request: OptimizationRequest):
    try:
        result = solver.solve(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/history")
async def save_history(data: dict):
    return db.save_optimization_history(data)

@app.get("/history")
async def get_history(limit: int = 50):
    return db.get_optimization_history(limit)

@app.get("/history/{history_id}")
async def get_history_detail(history_id: int):
    result = db.get_history_by_id(history_id)
    if not result:
        raise HTTPException(status_code=404, detail="记录不存在")
    return result

@app.delete("/history/{history_id}")
async def delete_history(history_id: int):
    db.delete_history(history_id)
    return {"status": "deleted"}

@app.get("/config")
async def get_config():
    return {
        "plant": DEFAULT_CONFIG.name,
        "target_power": DEFAULT_CONFIG.target_power,
        "operating_hours": DEFAULT_CONFIG.operating_hours,
        "max_sulfur_in_furnace": DEFAULT_CONFIG.max_sulfur_in_furnace,
        "heat_value_range": [DEFAULT_CONFIG.min_heat_value, DEFAULT_CONFIG.max_heat_value],
        "refund": {
            "enabled": DEFAULT_CONFIG.enable_tax_refund,
            "threshold": DEFAULT_CONFIG.refund_heat_threshold,
            "min_ratio": DEFAULT_CONFIG.refund_min_ratio,
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
