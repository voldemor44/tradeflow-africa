// ─── Marqueur de carte rendu en JSX ────────────────────────
// Mapbox attend un élément DOM réel : createMarkerEl monte le
// composant Marker dans un conteneur via createRoot (même
// approche que ShipmentPopup).

import { createRoot } from "react-dom/client";
import {
  MODE_COLORS,
  TRANSPORT_ICONS,
  FALLBACK_ICON,
  BLOCKED_STATUS,
  BLOCKED_COLOR,
} from "./constants.js";

const MARKER_PULSE_STYLE = {
  position: "absolute",
  top: -6,
  left: -6,
  width: "calc(100% + 12px)",
  height: "calc(100% + 12px)",
  borderRadius: "50%",
  border: `2px solid ${BLOCKED_COLOR}`,
  animation: "tf-pulse 1.5s ease-out infinite",
  opacity: 0.6,
};

const Marker = ({ shipment, isSelected }) => {
  const colors = MODE_COLORS[shipment.transport_mode] ?? MODE_COLORS.sea;
  const icon = TRANSPORT_ICONS[shipment.transport_mode] ?? FALLBACK_ICON;
  const isBlocked = shipment.status === BLOCKED_STATUS;
  const color = isBlocked ? BLOCKED_COLOR : colors.primary;
  const size = isSelected ? 36 : 28;

  return (
    <div
      className="tradeflow-marker"
      style={{
        width: size,
        height: size,
        background: color,
        border: `2.5px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.8)"}`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        transition: "all .2s ease",
        position: "relative",
      }}
    >
      <i
        className={`fas ${icon}`}
        style={{ color: "#fff", fontSize: isSelected ? 14 : 10 }}
      />
      {isBlocked && <div style={MARKER_PULSE_STYLE} />}
    </div>
  );
};

export const createMarkerEl = (shipment, isSelected) => {
  const container = document.createElement("div");
  createRoot(container).render(
    <Marker shipment={shipment} isSelected={isSelected} />,
  );
  return container;
};

export default Marker;
