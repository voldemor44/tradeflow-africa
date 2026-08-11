import { useEffect, useRef, useMemo } from "react";
import markerIcon from "../../assets/img/media.png";
import { useTranslation } from "react-i18next";
import "../../assets/css/WorldMap.css";

// === CONFIGURATION ===
const DEFAULT_CONFIG = {
  center: [8.0, 10.0],
  zoom: 2,
  minZoom: 1.4,
  tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  clusterRadius: 80,
  popupMinWidth: 200,
};

const CLUSTER_SIZES = {
  SMALL: { threshold: 10, class: "marker-cluster-small" },
  MEDIUM: { threshold: 100, class: "marker-cluster-medium" },
  LARGE: { threshold: Infinity, class: "marker-cluster-large" },
};

const THEME_FILTERS = {
  dark: [
    "invert:98%",
    "grayscale:69%",
    "bright:89%",
    "contrast:111%",
    "hue:205deg",
    "saturate:1000%",
  ],
  light: ["bright:101%", "contrast:101%", "hue:23deg", "saturate:225%"],
};

// === EXPÉDITIONS ACTIVES TRADEFLOW (données démo) ===
const getDefaultLocations = (t) => [
  // Port de Cotonou (destination principale)
  {
    name: "Port de Cotonou",
    location: "Bénin",
    shipmentId: t("dashboard.mapHub"),
    status: "hub",
    lat: 6.3654,
    long: 2.4183,
  },
  // Expéditions en cours — positions navires en mer
  {
    name: "MV Ever Given",
    location: "Océan Atlantique",
    shipmentId: "TFA-2025-0045",
    status: t("dashboard.mapAtSea"),
    lat: 14.5,
    long: -18.0,
  },
  {
    name: "MV CMA CGM Marco Polo",
    location: "Golfe de Guinée",
    shipmentId: "TFA-2025-0038",
    status: t("dashboard.mapAtSea"),
    lat: 3.5,
    long: 2.8,
  },
  // Ports d'origine
  {
    name: "Port de Shanghai",
    location: "Chine",
    shipmentId: "TFA-2025-0045 / 0038",
    status: t("dashboard.mapDeparture"),
    lat: 31.2304,
    long: 121.4737,
  },
  {
    name: "Port de Marseille",
    location: "France",
    shipmentId: "TFA-2025-0044",
    status: t("dashboard.mapInTransit"),
    lat: 43.2965,
    long: 5.3698,
  },
  {
    name: "Port de Mumbai",
    location: "Inde",
    shipmentId: "TFA-2025-0041",
    status: t("dashboard.mapAtPort"),
    lat: 18.9220,
    long: 72.8347,
  },
  {
    name: "Port d'Istanbul",
    location: "Turquie",
    shipmentId: "TFA-2025-0042",
    status: t("dashboard.mapDelivered"),
    lat: 41.0082,
    long: 28.9784,
  },
  {
    name: "Port de Dubaï",
    location: "Émirats Arabes Unis",
    shipmentId: "TFA-2025-0039",
    status: t("dashboard.mapDelivered"),
    lat: 25.2048,
    long: 55.2708,
  },
  {
    name: "Aéroport CDG",
    location: "France",
    shipmentId: "TFA-2025-0043",
    status: t("dashboard.mapBlocked"),
    lat: 49.0097,
    long: 2.5479,
  },
  // Destinations ECOWAS (expansion Phase 3)
  {
    name: "Port de Lomé",
    location: "Togo",
    shipmentId: t("dashboard.mapEcoPartner"),
    status: t("dashboard.mapPartner"),
    lat: 6.1375,
    long: 1.2123,
  },
  {
    name: "Port d'Abidjan",
    location: "Côte d'Ivoire",
    shipmentId: t("dashboard.mapEcoPartner"),
    status: t("dashboard.mapPartner"),
    lat: 5.3600,
    long: -4.0083,
  },
  {
    name: "Port de Dakar",
    location: "Sénégal",
    shipmentId: t("dashboard.mapEcoPartner"),
    status: t("dashboard.mapPartner"),
    lat: 14.6928,
    long: -17.4467,
  },
];

// === UTILITAIRES ===
const getCurrentThemeFilters = () => {
  const currentTheme = window.config?.config?.phoenixTheme || "light";
  return THEME_FILTERS[currentTheme] || THEME_FILTERS.light;
};

const getClusterSizeClass = (markerCount) => {
  if (markerCount >= CLUSTER_SIZES.MEDIUM.threshold)
    return CLUSTER_SIZES.LARGE.class;
  if (markerCount >= CLUSTER_SIZES.SMALL.threshold)
    return CLUSTER_SIZES.MEDIUM.class;
  return CLUSTER_SIZES.SMALL.class;
};

const createPopupContent = (t, { name, location, shipmentId, status }) => `
  <h6 class="mb-1">${name}</h6>
  <p class="m-0 text-body-quaternary mb-1">${location}</p>
  ${shipmentId ? `<p class="m-0 fs-10"><strong>${t("dashboard.mapDossier")} :</strong> ${shipmentId}</p>` : ""}
  ${status ? `<span class="badge badge-phoenix badge-phoenix-info fs-10 mt-1">${status}</span>` : ""}
`;

// === COMPOSANT ===
const WorldMap = ({
  locations: locationsProp,
  config = {},
  containerClass = "col-12 col-xl-6",
  minHeight = 300,
}) => {
  const { t } = useTranslation();
  const locations = useMemo(
    () => locationsProp ?? getDefaultLocations(t),
    [locationsProp, t]
  );
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const mapConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    const { L } = window;
    if (!L || mapInstanceRef.current) return;

    tileLayerRef.current = L.tileLayer.colorFilter(mapConfig.tileUrl, {
      attribution: null,
      transparent: true,
      filter: getCurrentThemeFilters(),
    });

    mapInstanceRef.current = L.map("map", {
      center: L.latLng(...mapConfig.center),
      zoom: mapConfig.zoom,
      layers: [tileLayerRef.current],
      minZoom: mapConfig.minZoom,
    });

    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: false,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: mapConfig.clusterRadius,
      spiderfyDistanceMultiplier: 1.5,
      iconCreateFunction: (cluster) => {
        const markerCount = cluster.getChildCount();
        const sizeClass = getClusterSizeClass(markerCount);
        return new L.DivIcon({
          html: `<div><span>${markerCount}</span></div>`,
          className: `marker-cluster ${sizeClass}`,
          iconSize: new L.Point(40, 40),
        });
      },
    });

    locations.forEach((location) => {
      const markerIconInstance = L.icon({ iconUrl: markerIcon });
      const marker = L.marker([location.lat, location.long], {
        icon: markerIconInstance,
      });
      const popupContent = createPopupContent(t, location);
      marker.bindPopup(
        L.popup({ minWidth: mapConfig.popupMinWidth }).setContent(popupContent)
      );
      markerClusterGroup.addLayer(marker);
    });

    mapInstanceRef.current.addLayer(markerClusterGroup);

    const handleThemeChange = ({ detail: { control, value } }) => {
      if (control !== "phoenixTheme") return;
      const newFilters = THEME_FILTERS[value] || THEME_FILTERS.light;
      tileLayerRef.current.updateFilter(newFilters);
    };

    document.body.addEventListener("clickControl", handleThemeChange);

    return () => {
      document.body.removeEventListener("clickControl", handleThemeChange);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [locations, mapConfig, t]);

  return (
    <div className={containerClass}>
      <div className="mx-n4 mx-lg-n6 ms-xl-0 h-100">
        <div className="h-100 w-100">
          <div
            className="h-100 bg-body-emphasis"
            id="map"
            style={{ minHeight }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
