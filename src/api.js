import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Instancia autenticada (incluye token en cada request)
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Instancia pública (sin token — para endpoints abiertos como /flights/search)
export const publicApi = axios.create({ baseURL: BASE_URL });

export function getApiError(error, fallback = "Ocurrio un error inesperado") {
  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.error ||
    (typeof error.response?.data === "string" ? error.response.data : null) ||
    fallback
  );
}

export default api;
