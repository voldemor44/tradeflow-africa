// ─── Configuration Mapbox ──────────────────────────────────

export const MAPBOX_CONFIG = {
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

// ─── Couleurs & icônes par mode de transport ──────────────

export const MODE_COLORS = {
  sea: { primary: "#0dcaf0", secondary: "#0a9abd" },
  air: { primary: "#0d6efd", secondary: "#0a58ca" },
  road: { primary: "#ffc107", secondary: "#cc9a06" },
  multi: { primary: "#198754", secondary: "#146c43" },
};

export const TRANSPORT_ICONS = {
  sea: "fa-ship",
  air: "fa-plane",
  road: "fa-truck",
  multi: "fa-route",
};

export const FALLBACK_ICON = "fa-box";

// ─── Statuts ───────────────────────────────────────────────

export const BLOCKED_STATUS = "on_hold";
export const BLOCKED_COLOR = "#dc3545";
export const PROGRESS_ACTIVE_COLOR = "#0dcaf0";

export const STATUS_BADGE_COLORS = {
  on_hold: "danger",
  in_transit: "primary",
  on_vessel: "primary",
  at_dest_port: "warning",
  customs: "warning",
  delivered: "success",
};

export const FALLBACK_BADGE_COLOR = "secondary";

// ─── Divers ────────────────────────────────────────────────

export const STYLE_FETCH_TIMEOUT = 15_000;

export const MONTHS_SHORT = [
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

// CSS injecté une seule fois dans le document (animations popup & masquage des contrôles Mapbox).
export const MAP_CSS = `
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