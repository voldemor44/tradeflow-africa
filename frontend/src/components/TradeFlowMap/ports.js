// ─── Coordonnées portuaires & lignes de route ────────────────

export const PORT_COORDS = {
  Cotonou: [2.43, 6.35],
  Abidjan: [-3.99, 5.35],
  Dakar: [-17.44, 14.72],
  Lagos: [3.39, 6.45],
  Accra: [-0.19, 5.55],
  Lomé: [1.22, 6.13],
  Shanghai: [121.47, 31.23],
  Guangzhou: [113.26, 23.13],
  Ningbo: [121.55, 29.87],
  Marseille: [5.37, 43.3],
  "Le Havre": [0.11, 49.49],
  Rotterdam: [4.47, 51.92],
  Hambourg: [9.99, 53.55],
  Istanbul: [28.97, 41.01],
  Dubaï: [55.27, 25.2],
  Mumbai: [72.88, 19.08],
  "Paris CDG": [2.55, 49.01],
  Niamey: [2.11, 13.51],
  Ouagadougou: [-1.52, 12.36],
  Pékin: [116.39, 39.91],
};

export const getPortCoords = (city) => {
  if (PORT_COORDS[city]) return PORT_COORDS[city];
  const key = Object.keys(PORT_COORDS).find(
    (k) =>
      city.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(city.toLowerCase()),
  );
  return key ? PORT_COORDS[key] : null;
};

export const interpolateLine = (from, to, steps = 100) => {
  if (!window.turf) return [from, to];
  try {
    const line = window.turf.lineString([from, to]);
    const len = window.turf.length(line);
    const coords = [];
    for (let i = 0; i <= steps; i++) {
      const pt = window.turf.along(line, (len / steps) * i);
      coords.push(pt.geometry.coordinates);
    }
    return coords;
  } catch {
    return [from, to];
  }
};