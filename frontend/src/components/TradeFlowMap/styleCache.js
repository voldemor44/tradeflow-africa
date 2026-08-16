// ─── Cache des styles Mapbox ─────────────────────────────────
// Le JSON du style est mis en cache dans sessionStorage
// (persistant pendant toute la session de navigation) et en
// mémoire (accès immédiat), afin d'éviter tout re-téléchargement
// lors des navigations et changements de thème.

import {
  MAPBOX_CONFIG,
  STYLE_FETCH_TIMEOUT,
} from "./constants.js";

const CACHE_KEY_PREFIX = "tf-style:";

// Cache mémoire : évite même le coût de lecture de sessionStorage.
const STYLE_CACHE = new Map();

// sessionStorage peut être indisponible (navigation privée, quota,
// SSR…) : on teste sa présence une seule fois, sans jamais lever
// d'erreur.
const storageAvailable = () => {
  try {
    const testKey = `${CACHE_KEY_PREFIX}__test__`;
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const HAS_STORAGE =
  typeof window !== "undefined" && storageAvailable();

const readFromStorage = (url) => {
  if (!HAS_STORAGE) return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY_PREFIX + url);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeToStorage = (url, style) => {
  if (!HAS_STORAGE) return;
  try {
    window.sessionStorage.setItem(
      CACHE_KEY_PREFIX + url,
      JSON.stringify(style),
    );
  } catch {
    // Quota dépassé ou stockage indisponible : le cache mémoire suffit.
  }
};

const toStyleHttpUrl = (url) => {
  if (!url.startsWith("mapbox://")) return url;
  const [, type, username, styleId] = url.split("/");
  if (type !== "styles" || !username || !styleId) return url;
  return `https://api.mapbox.com/styles/v1/${username}/${styleId}`;
};

export const getCachedStyle = (url) => {
  const cached = STYLE_CACHE.get(url) ?? readFromStorage(url);
  if (cached) {
    STYLE_CACHE.set(url, cached);
    return Promise.resolve(cached);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STYLE_FETCH_TIMEOUT);

  const httpUrl = toStyleHttpUrl(url);
  const sep = httpUrl.includes("?") ? "&" : "?";
  const requestUrl = `${httpUrl}${sep}access_token=${MAPBOX_CONFIG.accessToken}`;

  return fetch(requestUrl, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error(`Style fetch failed: ${res.status}`);
      return res.json();
    })
    .then((style) => {
      STYLE_CACHE.set(url, style);
      writeToStorage(url, style);
      return style;
    })
    .catch((err) => {
      STYLE_CACHE.delete(url);
      throw err;
    })
    .finally(() => clearTimeout(timer));
};