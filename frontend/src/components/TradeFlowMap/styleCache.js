// ─── Cache des styles Mapbox ─────────────────────────────────
// Le JSON du style est téléchargé une seule fois puis réutilisé
// à chaque navigation / changement de thème (aucun re-téléchargement).

import {
  MAPBOX_CONFIG,
  STYLE_FETCH_TIMEOUT,
} from "./constants.js";

const STYLE_CACHE = new Map();

const toStyleHttpUrl = (url) => {
  if (!url.startsWith("mapbox://")) return url;
  const [, type, username, styleId] = url.split("/");
  if (type !== "styles" || !username || !styleId) return url;
  return `https://api.mapbox.com/styles/v1/${username}/${styleId}`;
};

export const getCachedStyle = (url) => {
  const cached = STYLE_CACHE.get(url);
  if (cached) return Promise.resolve(cached);

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
      return style;
    })
    .catch((err) => {
      STYLE_CACHE.delete(url);
      throw err;
    })
    .finally(() => clearTimeout(timer));
};