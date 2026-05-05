import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// ─── CONFIG ────────────────────────────────────────────────

const MAPBOX_CONFIG = {
  accessToken:
    "pk.eyJ1IjoidGhlbWV3YWdvbiIsImEiOiJjbGhmNW5ybzkxcmoxM2RvN2RmbW1nZW90In0.hGIvQ890TYkZ948MVrsMIQ",
  styles: {
    default: "mapbox://styles/mapbox/light-v11",
    light: "mapbox://styles/themewagon/clj57pads001701qo25756jtw",
    dark: "mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew",
  },
  defaultCenter: [4.5, 5.5],
  defaultZoom: 2.8,
  defaultPitch: 20,
};

mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

const MODE_COLORS = {
  sea: { primary: "#0dcaf0", secondary: "#0a9abd" },
  air: { primary: "#0d6efd", secondary: "#0a58ca" },
  road: { primary: "#ffc107", secondary: "#cc9a06" },
  multi: { primary: "#198754", secondary: "#146c43" },
};

const getThemeColor = (name, fallback) =>
  window.phoenix?.utils?.getColor?.(name) || fallback;

const isDark = () => window.config?.config?.phoenixTheme === "dark";

// ─── HELPERS ───────────────────────────────────────────────

const createMarkerEl = (shipment, isSelected) => {
  const colors = MODE_COLORS[shipment.transport_mode] ?? MODE_COLORS.sea;
  const icons = {
    sea: "fa-ship",
    air: "fa-plane",
    road: "fa-truck",
    multi: "fa-route",
  };
  const icon = icons[shipment.transport_mode] ?? "fa-box";
  const isBlocked = shipment.status === "on_hold";
  const color = isBlocked ? "#dc3545" : colors.primary;
  const size = isSelected ? 36 : 28;

  const el = document.createElement("div");
  el.className = "tradeflow-marker";
  el.style.cssText = `
    width: ${size}px; height: ${size}px;
    background: ${color};
    border: 2.5px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.8)"};
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    transition: all .2s ease;
    position: relative;
  `;
  el.innerHTML = `<i class="fas ${icon}" style="color:#fff; font-size:${isSelected ? 14 : 10}px;"></i>`;

  if (isBlocked) {
    const pulse = document.createElement("div");
    pulse.style.cssText = `
      position: absolute; top: -6px; left: -6px;
      width: calc(100% + 12px); height: calc(100% + 12px);
      border-radius: 50%;
      border: 2px solid #dc3545;
      animation: tf-pulse 1.5s ease-out infinite;
      opacity: 0.6;
    `;
    el.appendChild(pulse);
  }
  return el;
};

const createPopupHTML = (s) => {
  const fmtDate = (iso) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    const mo = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    return `${d} ${mo[+m - 1]} ${y}`;
  };
  const statusBadgeColor = {
    on_hold: "danger",
    in_transit: "primary",
    on_vessel: "primary",
    at_dest_port: "warning",
    customs: "warning",
    delivered: "success",
  };
  const badgeColor = statusBadgeColor[s.status] ?? "secondary";

  return `
    <div style="min-width:220px; font-family:inherit;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <strong style="font-size:13px; color:var(--phoenix-primary);">${s.reference}</strong>
        <span class="badge badge-phoenix badge-phoenix-${badgeColor}" style="font-size:10px;">${s.status_display}</span>
      </div>
      <p style="margin:0 0 6px; font-size:12px; color:var(--phoenix-body-tertiary-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">
        ${s.goods_description}
      </p>
      <div style="font-size:11px; color:var(--phoenix-body-tertiary-color); margin-bottom:4px;">
        <span style="opacity:.6;">●</span> ${s.origin_port_or_city} (${s.origin_country})
        <span style="margin:0 4px;">→</span>
        <strong style="color:var(--phoenix-body-color);">${s.destination_port_or_city} (${s.destination_country})</strong>
      </div>
      ${
        s.vessel
          ? `
        <div style="font-size:11px; color:var(--phoenix-body-tertiary-color);">
          <i class="fas fa-ship" style="margin-right:4px;"></i>${s.vessel.name}
          ${s.vessel.speed > 0 ? "· " + s.vessel.speed + " kn" : "· À l'arrêt"}
        </div>`
          : ""
      }
      ${
        s.road
          ? `
        <div style="font-size:11px; color:var(--phoenix-body-tertiary-color);">
          <i class="fas fa-truck" style="margin-right:4px;"></i>${s.road.plate} · ${s.road.driver}
        </div>`
          : ""
      }
      <div style="margin-top:8px; background:var(--phoenix-body-secondary-bg); border-radius:4px; overflow:hidden; height:4px;">
        <div style="height:100%; width:${(s.vessel ?? s.road)?.progress ?? 0}%; background:${s.status === "on_hold" ? "#dc3545" : "#0dcaf0"}; border-radius:4px;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px; color:var(--phoenix-body-tertiary-color);">
        <span>Progression : <strong>${(s.vessel ?? s.road)?.progress ?? 0}%</strong></span>
        <span>ETA : <strong>${fmtDate(s.estimated_arrival)}</strong></span>
      </div>
    </div>
  `;
};

// ─── COMPOSANT ─────────────────────────────────────────────

const TradeFlowMap = ({
  shipments = [],
  selectedId = null,
  onSelect = () => {},
  showControls = true,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const popupRef = useRef(null);

  // ── Initialisation ─────────────────────────────────────
  useEffect(() => {
    if (!mapboxgl || !containerRef.current) return;

    if (!document.getElementById("tf-map-styles")) {
      const style = document.createElement("style");
      style.id = "tf-map-styles";
      style.textContent = `
        @keyframes tf-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0;   }
        }
        .mapboxgl-popup-content {
          border-radius: 8px !important;
          padding: 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
        }
        .mapboxgl-popup-close-button { font-size: 16px; padding: 4px 8px; }
        .mapboxgl-ctrl-top-right,
        .mapboxgl-ctrl-bottom-right,
        .mapboxgl-ctrl-bottom-left { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
    const theme = window.config?.config?.phoenixTheme ?? "light";
    const mapStyle = MAPBOX_CONFIG.styles[theme] ?? MAPBOX_CONFIG.styles.light;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
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

    const onThemeChange = ({ detail: { control } }) => {
      if (control !== "phoenixTheme") return;
      const t = window.config.config.phoenixTheme;
      map.setStyle(MAPBOX_CONFIG.styles[t] ?? MAPBOX_CONFIG.styles.light);
    };
    document.body.addEventListener("clickControl", onThemeChange);

    return () => {
      document.body.removeEventListener("clickControl", onThemeChange);
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // ── Marqueurs & routes ─────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addContent = () => {
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
          onSelect(s);
          popupRef.current
            .setLngLat(coords)
            .setHTML(createPopupHTML(s))
            .addTo(map);
        });

        markersRef.current[s.id] = { marker, el };

        const destCoords = getPortCoords(
          s.destination_country,
          s.destination_port_or_city,
        );
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
        const isBlock = s.status === "on_hold";
        const lineColor = isBlock ? "#dc3545" : colors.primary;

        map.addSource(`route-${s.id}`, { type: "geojson", data: routeData });
        map.addLayer({
          id: `route-line-${s.id}`,
          source: `route-${s.id}`,
          type: "line",
          paint: {
            "line-color": lineColor,
            "line-width": isSelected ? 2.5 : 1.5,
            "line-opacity": isSelected ? 0.9 : 0.4,
            "line-dasharray": isBlock ? [2, 2] : [1],
          },
        });
      });
    };

    if (map.isStyleLoaded()) {
      addContent();
    } else {
      map.once("load", addContent);
    }
  }, [shipments, selectedId]);

  // ── Fly to sélection ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const s = shipments.find((x) => x.id === selectedId);
    const pos = s?.vessel ?? s?.road;
    if (!pos?.lat || !pos?.lng) return;
    map.flyTo({ center: [pos.lng, pos.lat], zoom: 5, speed: 1.2, curve: 1.4 });
  }, [selectedId, shipments]);

  // ── Handlers ───────────────────────────────────────────
  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const fullscreen = () => containerRef.current?.requestFullscreen?.();
  const resetView = () =>
    mapRef.current?.flyTo({
      center: MAPBOX_CONFIG.defaultCenter,
      zoom: MAPBOX_CONFIG.defaultZoom,
      pitch: MAPBOX_CONFIG.defaultPitch,
      speed: 1,
    });

  const CONTROLS = [
    { onClick: zoomIn, icon: "fa-plus", title: "Zoom +" },
    { onClick: zoomOut, icon: "fa-minus", title: "Zoom -" },
    { onClick: resetView, icon: "fa-earth-africa", title: "Vue globale" },
    {
      onClick: fullscreen,
      icon: "fa-up-right-and-down-left-from-center",
      title: "Plein écran",
    },
  ];

  // ── Rendu ──────────────────────────────────────────────
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        minHeight: 480,
        width: "100%",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          overflow: "hidden",
        }}
        aria-label="Carte de suivi des expéditions TradeFlow"
      />

      {showControls && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {CONTROLS.map(({ onClick, icon, title }) => (
            <button
              key={title}
              onClick={onClick}
              title={title}
              aria-label={title}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "none",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#444",
                fontSize: 13,
                transition: "background .15s, color .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0d6efd";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                e.currentTarget.style.color = "#444";
              }}
            >
              <span className={`fa-solid ${icon}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeFlowMap;

// ─── UTILS ─────────────────────────────────────────────────

const PORT_COORDS = {
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

const getPortCoords = (country, city) => {
  if (PORT_COORDS[city]) return PORT_COORDS[city];
  const key = Object.keys(PORT_COORDS).find(
    (k) =>
      city.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(city.toLowerCase()),
  );
  return key ? PORT_COORDS[key] : null;
};

const interpolateLine = (from, to, steps = 100) => {
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
