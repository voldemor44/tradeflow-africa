// ─── Hooks Mapbox : initialisation, popup & contenu ──────────

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import mapboxgl from "mapbox-gl";
import { MAPBOX_CONFIG, MAP_CSS } from "./constants.js";
import { getCachedStyle } from "./styleCache.js";
import { createMarkerEl } from "./markers.js";
import { getPortCoords, interpolateLine } from "./ports.js";
import { MODE_COLORS, BLOCKED_STATUS, BLOCKED_COLOR } from "./constants.js";
import ShipmentPopup from "./ShipmentPopup.jsx";

// ── Initialisation de la carte ────────────────────────────────
// Style mis en cache pour éviter de le re-télécharger à chaque
// navigation ou changement de thème.

export const useMapboxInit = ({ containerRef, mapRef, popupRef, markersRef }) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapboxgl || !containerRef.current) return;

    if (!document.getElementById("tf-map-styles")) {
      const style = document.createElement("style");
      style.id = "tf-map-styles";
      style.textContent = MAP_CSS;
      document.head.appendChild(style);
    }

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
    const theme = window.config?.config?.phoenixTheme ?? "light";
    const initialStyleUrl =
      MAPBOX_CONFIG.styles[theme] ?? MAPBOX_CONFIG.styles.light;

    let cancelled = false;

    const onThemeChange = ({ detail: { control } }) => {
      if (control !== "phoenixTheme") return;
      const nextTheme = window.config.config.phoenixTheme;
      const nextUrl =
        MAPBOX_CONFIG.styles[nextTheme] ?? MAPBOX_CONFIG.styles.light;
      getCachedStyle(nextUrl)
        .then((style) => mapRef.current?.setStyle(style))
        .catch(() => mapRef.current?.setStyle(nextUrl));
    };

    const initMap = (style) => {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style, // objet (cache) ou URL (repli d'origine)
        center: MAPBOX_CONFIG.defaultCenter,
        zoom: MAPBOX_CONFIG.defaultZoom,
        pitch: MAPBOX_CONFIG.defaultPitch,
        attributionControl: false,
      });

      mapRef.current = map;
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: "260px",
      });

      document.body.addEventListener("clickControl", onThemeChange);
      setMapReady(true);
    };

    getCachedStyle(initialStyleUrl)
      .then((style) => {
        if (!cancelled) initMap(style);
      })
      .catch(() => {
        // Cache froid ou erreur réseau → comportement d'origine
        if (!cancelled) initMap(initialStyleUrl);
      });

    return () => {
      cancelled = true;
      document.body.removeEventListener("clickControl", onThemeChange);
      mapRef.current?.remove();
      mapRef.current = null;
      popupRef.current = null;
      markersRef.current = {};
    };
  }, [containerRef, mapRef, popupRef, markersRef]);

  return mapReady;
};

// ── Popup rendue en React (contenu JSX, translations à jour) ──

export const useMapPopup = ({ mapRef, popupRef }) => {
  const { t } = useTranslation();
  const tRef = useRef(t);
  const popupRootRef = useRef(null);
  const lastShipmentRef = useRef(null);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const showPopup = useCallback(
    (shipment, coords) => {
      const map = mapRef.current;
      if (!map || !popupRef.current) return;

      // Racine React unique, réutilisée pour chaque popup (aucune fuite).
      if (!popupRootRef.current) {
        const container = document.createElement("div");
        popupRootRef.current = { root: createRoot(container), container };
      }

      lastShipmentRef.current = shipment;
      popupRootRef.current.root.render(
        <ShipmentPopup shipment={shipment} t={tRef.current} />,
      );

      popupRef.current
        .setLngLat(coords)
        .setDOMContent(popupRootRef.current.container)
        .addTo(map);
    },
    [mapRef, popupRef],
  );

  // Rafraîchit la popup ouverte au changement de langue.
  useEffect(() => {
    const s = lastShipmentRef.current;
    if (s && popupRef.current?.isOpen?.()) {
      popupRootRef.current?.root.render(<ShipmentPopup shipment={s} t={t} />);
    }
  }, [t, popupRef]);

  return showPopup;
};

// ── Marqueurs & routes ────────────────────────────────────────

export const useMapContent = ({
  mapRef,
  markersRef,
  shipments,
  selectedId,
  mapReady,
  onSelectRef,
  showPopup,
}) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    const addContent = () => {
      if (cancelled) return;
      Object.values(markersRef.current).forEach(({ marker }) =>
        marker.remove(),
      );
      markersRef.current = {};

      // Layer avant source (ordre obligatoire Mapbox)
      const existingLayers = map.getStyle()?.layers ?? [];
      const existingSources = Object.keys(map.getStyle()?.sources ?? {});
      existingLayers
        .filter((l) => l.id.startsWith("route-line-"))
        .forEach((l) => map.removeLayer(l.id));
      existingSources
        .filter((id) => id.startsWith("route-"))
        .forEach((id) => map.removeSource(id));

      shipments.forEach((s) => {
        const pos = s.vessel ?? s.road;
        if (!pos?.lat || !pos?.lng) return;

        const coords = [pos.lng, pos.lat];
        const isSelected = s.id === selectedId;

        const el = createMarkerEl(s, isSelected);
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat(coords)
          .addTo(map);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(s);
          showPopup(s, coords);
        });

        markersRef.current[s.id] = { marker, el };

        const destCoords = getPortCoords(s.destination_port_or_city);
        if (!destCoords) return;

        const routeData = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: window.turf
              ? interpolateLine(coords, destCoords)
              : [coords, destCoords],
          },
        };

        const colors = MODE_COLORS[s.transport_mode] ?? MODE_COLORS.sea;
        const isBlock = s.status === BLOCKED_STATUS;
        const lineColor = isBlock ? BLOCKED_COLOR : colors.primary;

        // route line adding
        const sourceId = `route-${s.id}`;
        const layerId = `route-line-${s.id}`;
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, { type: "geojson", data: routeData });
        }
        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            source: sourceId,
            type: "line",
            paint: {
              "line-color": lineColor,
              "line-width": isSelected ? 2.5 : 1.8,
              "line-opacity": isSelected ? 0.9 : 0.4,
              "line-dasharray": isBlock ? [2, 2] : [1],
            },
          });
        }
      });
    };

    if (map.isStyleLoaded()) {
      addContent();
    } else {
      // Évite un double addContent si les props changent pendant le chargement
      map.once("load", addContent);
      return () => {
        cancelled = true;
        map.off("load", addContent);
      };
    }
  }, [shipments, selectedId, mapReady, mapRef, markersRef, onSelectRef, showPopup]);
};