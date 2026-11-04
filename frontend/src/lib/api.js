import axios from "axios";

export const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const ACCESS = "access";
const REFRESH = "refresh";

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS);
  },
  get refresh() {
    return localStorage.getItem(REFRESH);
  },
  set(access, refresh) {
    localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = tokens.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try once to refresh the access token, then replay the request.
let refreshing = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const canRefresh =
      error.response?.status === 401 && tokens.refresh && !original._retry && !original.url.includes("/token/");

    if (!canRefresh) return Promise.reject(error);

    original._retry = true;
    try {
      refreshing ??= axios
        .post(`${API_URL}/api/token/refresh/`, { refresh: tokens.refresh })
        .then(({ data }) => tokens.set(data.access, data.refresh))
        .finally(() => (refreshing = null));
      await refreshing;
      return api(original);
    } catch (refreshError) {
      tokens.clear();
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(refreshError);
    }
  },
);

/** Turn any API error into one readable sentence. */
export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error.response) return "The server cannot be reached. Check that the backend is running.";
  const data = error.response.data;
  if (typeof data === "string") return fallback;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data).flat()[0];
    if (typeof first === "string") return first;
  }
  return fallback;
}

export default api;
