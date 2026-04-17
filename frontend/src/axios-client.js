/**
 * TradeFlow Africa — axios-client.js
 *
 * Instance Axios préconfigurée avec :
 *  - Base URL depuis les variables d'environnement (Vite)
 *  - Injection automatique du token JWT dans chaque requête
 *  - Refresh automatique du token expiré (intercepteur de réponse)
 *  - Déconnexion propre si le refresh échoue
 *  - File d'attente des requêtes en attente pendant le refresh
 */

import axios from "axios";

// ─── CONSTANTES ────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
const STORAGE = () =>
  localStorage.getItem("ACCESS_TOKEN") ? localStorage : sessionStorage;

const TOKEN_URLS = {
  refresh: "/auth/token/refresh/",
  logout: "/auth/logout/",
  login: "/auth/login/",
  register: "/auth/register/",
};

// URLs publiques — pas d'injection de token
const PUBLIC_URLS = new Set([
  TOKEN_URLS.login,
  TOKEN_URLS.register,
  TOKEN_URLS.refresh,
]);

// ─── INSTANCE ──────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── HELPERS ───────────────────────────────────────────────

const getAccessToken = () =>
  localStorage.getItem("ACCESS_TOKEN") ?? sessionStorage.getItem("ACCESS_TOKEN");

const getRefreshToken = () =>
  localStorage.getItem("REFRESH_TOKEN") ?? sessionStorage.getItem("REFRESH_TOKEN");

const setTokens = ({ access, refresh }) => {
  const store = STORAGE();
  store.setItem("ACCESS_TOKEN", access);
  if (refresh) store.setItem("REFRESH_TOKEN", refresh);
};

const clearSession = () => {
  ["ACCESS_TOKEN", "REFRESH_TOKEN", "user"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

const redirectToLogin = () => {
  clearSession();
  // Évite une boucle si on est déjà sur /login
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

// ─── GESTION DU REFRESH (file d'attente) ───────────────────
//
// Si plusieurs requêtes expirent en même temps, une seule demande
// de refresh est émise. Les autres attendent dans la queue.

let isRefreshing = false;
let failedQueue = []; // [{ resolve, reject }]

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const { data } = await axios.post(
    `${BASE_URL}${TOKEN_URLS.refresh}`,
    { refresh },
    { headers: { "Content-Type": "application/json" } },
  );
  // SimpleJWT avec ROTATE_REFRESH_TOKENS=True retourne aussi un nouveau refresh
  setTokens({ access: data.access, refresh: data.refresh ?? null });
  return data.access;
};

// ─── INTERCEPTEUR REQUEST ──────────────────────────────────
// Injecte le Bearer token sur toutes les requêtes non-publiques

axiosClient.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_URLS.has(config.url);
    if (!isPublic) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── INTERCEPTEUR RESPONSE ─────────────────────────────────
// Tente un refresh automatique sur les 401

axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Ignore les erreurs non-401, les requêtes publiques et
    // les requêtes déjà retentées pour éviter les boucles infinies
    const is401 = error.response?.status === 401;
    const isPublic = PUBLIC_URLS.has(originalRequest.url);
    const alreadyRetried = originalRequest._retry;

    if (!is401 || isPublic || alreadyRetried) {
      return Promise.reject(error);
    }

    // Marque la requête comme déjà retentée
    originalRequest._retry = true;

    // Si un refresh est déjà en cours → met dans la file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Démarre le refresh
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── EXPORT ────────────────────────────────────────────────

export default axiosClient;
export { clearSession, getAccessToken, getRefreshToken, setTokens };
