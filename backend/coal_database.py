from models import CoalType
from typing import List

COAL_DATABASE = {
    1: CoalType(
        id=1, name="低热值煤1", heat_value=2376.38, sulfur=1.5393,
        ash=53.75, price=299.10, max_available=16.55,
        moisture=9.05, volatile=20.24, qualifies_for_refund=True
    ),
    2: CoalType(
        id=2, name="低热值煤2", heat_value=1731.53, sulfur=0.4161,
        ash=59.61, price=214.88, max_available=10.30,
        moisture=9.9, volatile=16.80, qualifies_for_refund=True
    ),
    3: CoalType(
        id=3, name="高热值煤1", heat_value=0, sulfur=0.63,
        ash=65.22, price=0, max_available=0,
        moisture=15.68, volatile=58.6, qualifies_for_refund=False
    ),
    4: CoalType(
        id=4, name="高热值煤2", heat_value=0, sulfur=0.34,
        ash=71.46, price=0, max_available=0,
        moisture=8.93, volatile=56.85, qualifies_for_refund=False
    ),
    5: CoalType(
        id=5, name="褐煤2（云）长协", heat_value=2400, sulfur=0.805,
        ash=32.97, price=295.2, max_available=0,
        moisture=19.2, volatile=28.48, qualifies_for_refund=True
    ),
    6: CoalType(
        id=6, name="褐煤3（云）长协", heat_value=3200, sulfur=0.847,
        ash=23.87, price=425.6, max_available=3,
        moisture=19.15, volatile=30.51, qualifies_for_refund=False
    ),
    7: CoalType(
        id=7, name="褐煤3（云）", heat_value=3200, sulfur=0.847,
        ash=23.87, price=426.56, max_available=8,
        moisture=19.15, volatile=30.51, qualifies_for_refund=False
    ),
    8: CoalType(
        id=8, name="褐煤32（港1）", heat_value=3200, sulfur=0.7757,
        ash=19.44, price=540.12, max_available=0,
        moisture=32.11, volatile=24.83, qualifies_for_refund=False
    ),
    9: CoalType(
        id=9, name="褐煤35（港2）", heat_value=3500, sulfur=0.7817,
        ash=17.72, price=605.97, max_available=0,
        moisture=29.81, volatile=26.88, qualifies_for_refund=False
    ),
    10: CoalType(
        id=10, name="褐煤38（港3）", heat_value=3800, sulfur=0.8297,
        ash=8.67, price=643.66, max_available=0,
        moisture=34.68, volatile=28.64, qualifies_for_refund=False
    ),
    11: CoalType(
        id=11, name="褐煤46", heat_value=4600, sulfur=0.2081,
        ash=10.88, price=742.54, max_available=100,
        moisture=23.09, volatile=32.85, qualifies_for_refund=False
    ),
    12: CoalType(
        id=12, name="烟煤55", heat_value=5500, sulfur=0.4766,
        ash=19.88, price=914.82, max_available=100,
        moisture=10.32, volatile=25.31, qualifies_for_refund=False
    ),
}

def get_coal(coal_id: int) -> CoalType:
    return COAL_DATABASE.get(coal_id)

def get_all_coals() -> List[CoalType]:
    return list(COAL_DATABASE.values())
