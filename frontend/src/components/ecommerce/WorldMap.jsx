import { useEffect, useRef } from "react";
import markerIcon from "../../assets/img/media.png";
import "../../assets/css/WorldMap.css";

// === CONFIGURATION ===
const DEFAULT_CONFIG = {
  center: [25.659195, 30.182691],
  zoom: 0.6,
  minZoom: 1.4,
  tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  clusterRadius: 80,
  popupMinWidth: 180,
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

// === DONNÉES DE DÉMONSTRATION ===
const DEFAULT_LOCATIONS = [
  {
    name: "New York",
    location: "USA",
    street: "Broadway",
    lat: 40.7128,
    long: -74.006,
  },
  {
    name: "Los Angeles",
    location: "USA",
    street: "Hollywood Blvd",
    lat: 34.0522,
    long: -118.2437,
  },
  {
    name: "Chicago",
    location: "USA",
    street: "Michigan Ave",
    lat: 41.8781,
    long: -87.6298,
  },
  {
    name: "Miami",
    location: "USA",
    street: "Ocean Drive",
    lat: 25.7617,
    long: -80.1918,
  },
  {
    name: "Toronto",
    location: "Canada",
    street: "Queen St",
    lat: 43.6532,
    long: -79.3832,
  },
  {
    name: "Vancouver",
    location: "Canada",
    street: "Robson St",
    lat: 49.2827,
    long: -123.1207,
  },
  {
    name: "Mexico City",
    location: "Mexico",
    street: "Reforma",
    lat: 19.4326,
    long: -99.1332,
  },
  {
    name: "London",
    location: "UK",
    street: "Baker St",
    lat: 51.5074,
    long: -0.1276,
  },
  {
    name: "Paris",
    location: "France",
    street: "Champs-Élysées",
    lat: 48.8566,
    long: 2.3522,
  },
  {
    name: "Berlin",
    location: "Germany",
    street: "Unter den Linden",
    lat: 52.52,
    long: 13.405,
  },
  {
    name: "Madrid",
    location: "Spain",
    street: "Gran Vía",
    lat: 40.4168,
    long: -3.7038,
  },
  {
    name: "Rome",
    location: "Italy",
    street: "Via del Corso",
    lat: 41.9028,
    long: 12.4964,
  },
  {
    name: "Dubai",
    location: "UAE",
    street: "Sheikh Zayed Rd",
    lat: 25.2048,
    long: 55.2708,
  },
  {
    name: "Abu Dhabi",
    location: "UAE",
    street: "Corniche",
    lat: 24.4539,
    long: 54.3773,
  },
  {
    name: "São Paulo",
    location: "Brazil",
    street: "Avenida Paulista",
    lat: -23.5505,
    long: -46.6333,
  },
  {
    name: "Rio de Janeiro",
    location: "Brazil",
    street: "Copacabana",
    lat: -22.9068,
    long: -43.1729,
  },
  {
    name: "Buenos Aires",
    location: "Argentina",
    street: "9 de Julio",
    lat: -34.6037,
    long: -58.3816,
  },
];

// === UTILITAIRES ===
/**
 * Récupère les filtres de couleur selon le thème actif
 */
const getCurrentThemeFilters = () => {
  const currentTheme = window.config?.config?.phoenixTheme || "light";
  return THEME_FILTERS[currentTheme] || THEME_FILTERS.light;
};

/**
 * Détermine la classe CSS du cluster selon le nombre de marqueurs
 */
const getClusterSizeClass = (markerCount) => {
  if (markerCount >= CLUSTER_SIZES.MEDIUM.threshold)
    return CLUSTER_SIZES.LARGE.class;
  if (markerCount >= CLUSTER_SIZES.SMALL.threshold)
    return CLUSTER_SIZES.MEDIUM.class;
  return CLUSTER_SIZES.SMALL.class;
};

/**
 * Crée le contenu HTML du popup pour un marqueur
 */
const createPopupContent = ({ name, street, location }) => `
  <h6 class="mb-1">${name}</h6>
  <p class="m-0 text-body-quaternary">${street}, ${location}</p>
`;

// === COMPOSANT PRINCIPAL ===
/**
 * Carte interactive avec clusters de marqueurs
 *
 * @param {Array} locations - Liste des emplacements à afficher
 * @param {Object} config - Configuration personnalisée de la carte
 * @param {string} containerClass - Classes CSS du conteneur
 * @param {number} minHeight - Hauteur minimale de la carte
 */
const WorldMap = ({
  locations = DEFAULT_LOCATIONS,
  config = {},
  containerClass = "col-12 col-xl-6",
  minHeight = 300,
}) => {
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Fusion de la config par défaut avec la config personnalisée
  const mapConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    const { L } = window;

    // Vérifier que Leaflet est chargé et éviter la double initialisation
    if (!L || mapInstanceRef.current) return;

    // === INITIALISATION DE LA CARTE ===

    // Créer la couche de tuiles avec filtre de couleur
    tileLayerRef.current = L.tileLayer.colorFilter(mapConfig.tileUrl, {
      attribution: null,
      transparent: true,
      filter: getCurrentThemeFilters(),
    });

    // Créer l'instance de la carte
    mapInstanceRef.current = L.map("map", {
      center: L.latLng(...mapConfig.center),
      zoom: mapConfig.zoom,
      layers: [tileLayerRef.current],
      minZoom: mapConfig.minZoom,
    });

    // === CONFIGURATION DES CLUSTERS ===

    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: false,
      spiderfyOnMaxZoom: true, // Déploie les marqueurs au zoom max
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true, // Zoom sur le cluster au clic
      maxClusterRadius: mapConfig.clusterRadius,
      spiderfyDistanceMultiplier: 1.5,

      // Fonction personnalisée pour créer les icônes de cluster
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

    // === AJOUT DES MARQUEURS ===

    locations.forEach((location) => {
      // Créer l'icône du marqueur
      const markerIconInstance = L.icon({ iconUrl: markerIcon });

      // Créer le marqueur
      const marker = L.marker([location.lat, location.long], {
        icon: markerIconInstance,
      });

      // Ajouter le popup au marqueur
      const popupContent = createPopupContent(location);
      marker.bindPopup(
        L.popup({ minWidth: mapConfig.popupMinWidth }).setContent(popupContent),
      );

      // Ajouter le marqueur au cluster
      markerClusterGroup.addLayer(marker);
    });

    // Ajouter le groupe de clusters à la carte
    mapInstanceRef.current.addLayer(markerClusterGroup);

    // === GESTION DU CHANGEMENT DE THÈME ===

    const handleThemeChange = ({ detail: { control, value } }) => {
      if (control !== "phoenixTheme") return;

      const newFilters = THEME_FILTERS[value] || THEME_FILTERS.light;
      tileLayerRef.current.updateFilter(newFilters);
    };

    document.body.addEventListener("clickControl", handleThemeChange);

    // === NETTOYAGE ===

    return () => {
      document.body.removeEventListener("clickControl", handleThemeChange);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [locations, mapConfig]);

  // === RENDU ===

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
