const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "inventario_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function resolveMediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
  } else if (options.body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    throw new Error("Sessione scaduta. Effettua di nuovo il login.");
  }

  if (!response.ok) {
    const text = await response.text();
    let detail = text || `Errore HTTP ${response.status}`;
    try {
      const data = JSON.parse(text);
      detail = data.detail || detail;
      if (Array.isArray(detail)) {
        detail = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      }
    } catch {
      // keep text detail
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function login(username, password) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);
  return request("/auth/login", {
    method: "POST",
    body,
  });
}

export function getMe() {
  return request("/auth/me");
}

export function getItems() {
  return request("/items");
}

export function getItem(id) {
  return request(`/items/${id}`);
}

function toItemFormData({ name, quantity, year, image }) {
  const body = new FormData();
  body.set("name", name);
  body.set("quantity", String(quantity));
  if (year === null || year === "" || Number.isNaN(Number(year))) {
    body.set("clear_year", "true");
  } else {
    body.set("year", String(Number(year)));
    body.set("clear_year", "false");
  }
  if (image instanceof File) {
    body.set("image", image);
  }
  return body;
}

export function createItem(payload) {
  return request("/items", {
    method: "POST",
    body: toItemFormData(payload),
  });
}

export function updateItem(id, payload) {
  return request(`/items/${id}`, {
    method: "PUT",
    body: toItemFormData(payload),
  });
}

export function deleteItem(id) {
  return request(`/items/${id}`, {
    method: "DELETE",
  });
}
