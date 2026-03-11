const API_BASE = 'http://localhost:8000';

export async function getCoals() {
  const res = await fetch(`${API_BASE}/coals`);
  return res.json();
}

export async function createCoal(coal) {
  const res = await fetch(`${API_BASE}/coals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coal)
  });
  return res.json();
}

export async function updateCoal(id, coal) {
  const res = await fetch(`${API_BASE}/coals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coal)
  });
  return res.json();
}

export async function deleteCoal(id) {
  const res = await fetch(`${API_BASE}/coals/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function optimizeBlend(config) {
  const res = await fetch(`${API_BASE}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_power: config.targetPower,
      selected_coals: config.selectedCoals,
      enable_refund_constraint: config.enableRefund,
      priority: config.priority
    })
  });
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
}

export async function getHistoryDetail(id) {
  const res = await fetch(`${API_BASE}/history/${id}`);
  return res.json();
}

export async function deleteHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function saveResult(result) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  });
  return res.json();
}
