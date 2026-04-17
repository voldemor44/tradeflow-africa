import { useEffect, useRef } from "react";

// === CONFIGURATION ===
const MAPBOX_CONFIG = {
  accessToken:
    "pk.eyJ1IjoidGhlbWV3YWdvbiIsImEiOiJjbGhmNW5ybzkxcmoxM2RvN2RmbW1nZW90In0.hGIvQ890TYkZ948MVrsMIQ",
  styles: {
    default: "mapbox://styles/mapbox/light-v11",
    light: "mapbox://styles/themewagon/clj57pads001701qo25756jtw",
    dark: "mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew",
  },
  defaultCenter: [-73.102712, 7.102257],
  defaultZoom: 5,
  defaultPitch: 40,
  interpolationSteps: 500,
};

const ROUTE_STYLES = {
  primary: {
    width: 2,
    sourceId: "route",
    layerId: "route",
  },
  secondary: {
    width: 1,
    sourceId: "route2",
    layerId: "route2",
  },
};

// === DONNÉES DE DÉMONSTRATION ===
const DEFAULT_FLIGHT_POINTS = [
  { id: 1, coords: [-61.100583, 5.044713], label: "Point A" },
  { id: 2, coords: [-74.2139449434892, 8.136553550752552], label: "Point B" },
  { id: 3, coords: [-84.913785, 10.325774], label: "Point C" },
];

const DEFAULT_ROUTES = [
  { from: 0, to: 1, style: "primary" }, // Route 1: Point A -> Point B
  { from: 1, to: 2, style: "secondary" }, // Route 2: Point B -> Point C
];

// === UTILITAIRES ===

/**
 * Récupère une couleur du thème Phoenix
 */
const getThemeColor = (colorName, fallback = "#3b82f6") => {
  return window.phoenix?.utils?.getColor?.(colorName) || fallback;
};

/**
 * Vérifie si le thème actuel est sombre
 */
const isDarkTheme = () => {
  return window.config?.config?.phoenixTheme === "dark";
};

/**
 * Crée un objet GeoJSON pour une route entre deux points
 */
const createRoute = (fromCoords, toCoords) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [fromCoords, toCoords],
      },
    },
  ],
});

/**
 * Interpole une route pour créer une ligne lisse
 */
const interpolateRoute = (route, steps = MAPBOX_CONFIG.interpolationSteps) => {
  if (!window.turf) return route;

  const routeLength = window.turf.length(route.features[0]);
  const interpolatedCoords = [];

  for (let i = 0; i < routeLength; i += routeLength / steps) {
    const point = window.turf.along(route.features[0], i);
    interpolatedCoords.push(point.geometry.coordinates);
  }

  route.features[0].geometry.coordinates = interpolatedCoords;
  return route;
};

// === COMPOSANT PRINCIPAL ===

/**
 * Carte de vol interactive avec routes et marqueurs
 *
 * @param {Array} flightPoints - Points de vol à afficher [{id, coords, label}]
 * @param {Array} routes - Routes entre les points [{from, to, style}]
 * @param {Object} mapConfig - Configuration personnalisée de la carte
 * @param {boolean} showControls - Afficher les contrôles de zoom/fullscreen
 */
const FlightMap = ({
  flightPoints = DEFAULT_FLIGHT_POINTS,
  routes = DEFAULT_ROUTES,
  mapConfig = {},
  showControls = true,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fusion de la config par défaut
  const finalConfig = {
    center: mapConfig.center || MAPBOX_CONFIG.defaultCenter,
    zoom: mapConfig.zoom || MAPBOX_CONFIG.defaultZoom,
    pitch: mapConfig.pitch || MAPBOX_CONFIG.defaultPitch,
  };

  useEffect(() => {
    // Vérifier que Mapbox et Turf sont chargés
    if (!window.mapboxgl || !mapContainerRef.current) return;

    // === INITIALISATION DE LA CARTE ===

    window.mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    const currentTheme = window.config?.config?.phoenixTheme || "light";
    const mapStyle =
      MAPBOX_CONFIG.styles[currentTheme] || MAPBOX_CONFIG.styles.light;

    const map = new window.mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: finalConfig.center,
      zoom: finalConfig.zoom,
      pitch: finalConfig.pitch,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // === AJOUT DES MARQUEURS ===

    flightPoints.forEach(({ coords, id, label }) => {
      const markerElement = document.createElement("div");
      markerElement.className = `marker-${id}`;
      markerElement.title = label || `Point ${id}`;

      new window.mapboxgl.Marker(markerElement).setLngLat(coords).addTo(map);
    });

    // === CRÉATION ET INTERPOLATION DES ROUTES ===

    const processedRoutes = routes
      .map(({ from, to, style }) => {
        const fromPoint = flightPoints[from];
        const toPoint = flightPoints[to];

        if (!fromPoint || !toPoint) {
          console.warn(`Route invalide: points ${from} -> ${to} non trouvés`);
          return null;
        }

        const route = createRoute(fromPoint.coords, toPoint.coords);
        const interpolatedRoute = interpolateRoute(route);

        return {
          data: interpolatedRoute.features[0],
          style: ROUTE_STYLES[style] || ROUTE_STYLES.primary,
        };
      })
      .filter(Boolean);

    // === AJOUT DES COUCHES DE ROUTES ===

    map.on("load", () => {
      processedRoutes.forEach(({ data, style }, index) => {
        const sourceId = `${style.sourceId}-${index}`;
        const layerId = `${style.layerId}-${index}`;

        // Ajouter la source de données
        map.addSource(sourceId, {
          type: "geojson",
          data: data,
        });

        // Déterminer la couleur selon le style et le thème
        let lineColor;
        if (style === ROUTE_STYLES.primary) {
          lineColor = isDarkTheme()
            ? getThemeColor("primary")
            : getThemeColor("primary-light");
        } else {
          lineColor = getThemeColor("warning");
        }

        // Ajouter la couche de ligne
        map.addLayer({
          id: layerId,
          source: sourceId,
          type: "line",
          paint: {
            "line-width": style.width,
            "line-color": lineColor,
          },
        });
      });
    });

    // === GESTION DU CHANGEMENT DE THÈME ===

    const handleThemeChange = ({ detail: { control } }) => {
      if (control !== "phoenixTheme") return;

      const newTheme = window.config.config.phoenixTheme;
      const newStyle =
        MAPBOX_CONFIG.styles[newTheme] || MAPBOX_CONFIG.styles.light;
      map.setStyle(newStyle);
    };

    document.body.addEventListener("clickControl", handleThemeChange);

    // === NETTOYAGE ===

    return () => {
      document.body.removeEventListener("clickControl", handleThemeChange);
      map.remove();
    };
  }, [flightPoints, routes, finalConfig]);

  // === HANDLERS DES CONTRÔLES ===

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFullscreen = () => mapContainerRef.current?.requestFullscreen();

  // === RENDU ===

  return (
    <div className="position-relative">
      {/* Conteneur de la carte */}
      <div
        ref={mapContainerRef}
        className="map rounded-3"
        id="flightMap"
        aria-label="Flight route map"
      />

      {/* Contrôles de navigation */}
      {showControls && (
        <div className="mapbox-control-btn flight-map-control-btn">
          <button
            className="zoomIn d-none d-md-block"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <span className="fa-solid fa-plus" />
          </button>
          <button
            className="zoomOut d-none d-md-block"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <span className="fa-solid fa-minus" />
          </button>
          <button
            className="fullScreen mt-md-3"
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
            title="Toggle fullscreen"
          >
            <span className="fa-solid fa-up-right-and-down-left-from-center" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FlightMap;
