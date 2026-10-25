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

function formatApiDetail(detail) {
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        if (typeof d === "string") return d;
        const loc = Array.isArray(d.loc)
          ? d.loc.filter((part) => part !== "body" && part !== "query").join(".")
          : "";
        const msg = translateValidationMsg(d.msg || JSON.stringify(d));
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  if (detail == null) return "Errore sconosciuto";
  return JSON.stringify(detail);
}

function translateValidationMsg(msg) {
  if (!msg || typeof msg !== "string") return String(msg);
  if (/greater than or equal to 0/i.test(msg)) {
    return "deve essere maggiore o uguale a 0";
  }
  if (/field required/i.test(msg)) return "campo obbligatorio";
  if (/string should have at least/i.test(msg)) {
    return "testo troppo corto";
  }
  if (/string should have at most/i.test(msg)) {
    return "testo troppo lungo";
  }
  if (/input should be a valid integer/i.test(msg)) {
    return "deve essere un numero intero";
  }
  return msg;
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

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Impossibile contattare il server. Verifica la connessione o che l'API sia attiva.",
    );
  }

  const isLoginRequest = path === "/auth/login";

  if (response.status === 401 && !isLoginRequest) {
    clearToken();
    throw new Error("Sessione scaduta. Effettua di nuovo il login.");
  }

  if (!response.ok) {
    const text = await response.text();
    let detail = text || `Errore HTTP ${response.status}`;
    try {
      const data = JSON.parse(text);
      detail = formatApiDetail(data.detail ?? detail);
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
