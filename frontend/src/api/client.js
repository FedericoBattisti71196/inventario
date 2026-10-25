const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Errore HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getItems() {
  return request("/items");
}

export function getItem(id) {
  return request(`/items/${id}`);
}

export function createItem(payload) {
  return request("/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateItem(id, payload) {
  return request(`/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteItem(id) {
  return request(`/items/${id}`, {
    method: "DELETE",
  });
}
