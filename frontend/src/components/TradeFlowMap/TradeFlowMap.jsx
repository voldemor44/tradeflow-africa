import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useTranslation } from "react-i18next";
import { MAPBOX_CONFIG } from "./constants.js";
import {
  useMapboxInit,
  useMapContent,
  useMapPopup,
} from "./mapHooks.jsx";
import MapControls from "./MapControls.jsx";

mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

// ─── COMPOSANT ──────────────────────────────────────────────

const TradeFlowMap = ({
  shipments = [],
  selectedId = null,
  onSelect = () => {},
  showControls = true,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const popupRef = useRef(null);
  // Refs stables : évitent de recréer tous les marqueurs à chaque re-rendu
  const onSelectRef = useRef(onSelect);

  const mapReady = useMapboxInit({
    containerRef,
    mapRef,
    popupRef,
    markersRef,
  });
  const showPopup = useMapPopup({ mapRef, popupRef });

  useMapContent({
    mapRef,
    markersRef,
    shipments,
    selectedId,
    mapReady,
    onSelectRef,
    showPopup,
  });

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // ── Fly to sélection ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const s = shipments.find((x) => x.id === selectedId);
    const pos = s?.vessel ?? s?.road;
    if (!pos?.lat || !pos?.lng) return;
    map.flyTo({ center: [pos.lng, pos.lat], zoom: 5, speed: 1.2, curve: 1.4 });
  }, [selectedId, shipments, mapReady]);

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
    { onClick: zoomIn, icon: "fa-plus", title: t("map.zoomIn") },
    { onClick: zoomOut, icon: "fa-minus", title: t("map.zoomOut") },
    { onClick: resetView, icon: "fa-earth-africa", title: t("map.globalView") },
    {
      onClick: fullscreen,
      icon: "fa-up-right-and-down-left-from-center",
      title: t("map.fullscreen"),
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
        aria-label={t("map.mapAriaLabel")}
      />

      {showControls && <MapControls controls={CONTROLS} />}
    </div>
  );
};

export default TradeFlowMap;