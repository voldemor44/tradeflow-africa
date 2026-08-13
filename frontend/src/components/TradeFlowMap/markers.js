// ─── Élément DOM du marqueur (requis par mapboxgl.Marker) ────

import {
  MODE_COLORS,
  TRANSPORT_ICONS,
  FALLBACK_ICON,
  BLOCKED_STATUS,
  BLOCKED_COLOR,
} from "./constants.js";

export const createMarkerEl = (shipment, isSelected) => {
  const colors = MODE_COLORS[shipment.transport_mode] ?? MODE_COLORS.sea;
  const icon = TRANSPORT_ICONS[shipment.transport_mode] ?? FALLBACK_ICON;
  const isBlocked = shipment.status === BLOCKED_STATUS;
  const color = isBlocked ? BLOCKED_COLOR : colors.primary;
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
      border: 2px solid ${BLOCKED_COLOR};
      animation: tf-pulse 1.5s ease-out infinite;
      opacity: 0.6;
    `;
    el.appendChild(pulse);
  }
  return el;
};