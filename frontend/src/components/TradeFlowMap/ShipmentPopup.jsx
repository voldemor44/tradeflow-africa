// Popup Mapbox rendu en JSX (injecté dans le DOM par createRoot).

import {
  STATUS_BADGE_COLORS,
  FALLBACK_BADGE_COLOR,
  MONTHS_SHORT,
  BLOCKED_STATUS,
  BLOCKED_COLOR,
  PROGRESS_ACTIVE_COLOR,
} from "./constants.js";

const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTHS_SHORT[+m - 1]} ${y}`;
};

const VesselRow = ({ vessel, t }) =>
  vessel ? (
    <div
      style={{
        fontSize: 11,
        color: "var(--phoenix-body-tertiary-color)",
      }}
    >
      <i className="fas fa-ship" style={{ marginRight: 4 }} />
      {vessel.name}
      {" "}
      {vessel.speed > 0
        ? `· ${vessel.speed} kn`
        : `· ${t("map.atStop")}`}
    </div>
  ) : null;

const RoadRow = ({ road }) =>
  road ? (
    <div
      style={{
        fontSize: 11,
        color: "var(--phoenix-body-tertiary-color)",
      }}
    >
      <i className="fas fa-truck" style={{ marginRight: 4 }} />
      {road.plate} · {road.driver}
    </div>
  ) : null;

const ShipmentPopup = ({ shipment, t }) => {
  const progress = (shipment.vessel ?? shipment.road)?.progress ?? 0;
  const badgeColor = STATUS_BADGE_COLORS[shipment.status] ?? FALLBACK_BADGE_COLOR;
  const barColor =
    shipment.status === BLOCKED_STATUS ? BLOCKED_COLOR : PROGRESS_ACTIVE_COLOR;

  return (
    <div style={{ minWidth: 220, fontFamily: "inherit" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <strong
          style={{
            fontSize: 13,
            color: "var(--phoenix-primary)",
          }}
        >
          {shipment.reference}
        </strong>
        <span
          className={`badge badge-phoenix badge-phoenix-${badgeColor}`}
          style={{ fontSize: 10 }}
        >
          {shipment.status_display}
        </span>
      </div>

      <p
        style={{
          margin: "0 0 6px",
          fontSize: 12,
          color: "var(--phoenix-body-tertiary-color)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 200,
        }}
      >
        {shipment.goods_description}
      </p>

      <div
        style={{
          fontSize: 11,
          color: "var(--phoenix-body-tertiary-color)",
          marginBottom: 4,
        }}
      >
        <span style={{ opacity: 0.6 }}>●</span>{" "}
        {shipment.origin_port_or_city} ({shipment.origin_country})
        <span style={{ margin: "0 4px" }}>→</span>
        <strong style={{ color: "var(--phoenix-body-color)" }}>
          {shipment.destination_port_or_city} ({shipment.destination_country})
        </strong>
      </div>

      <VesselRow vessel={shipment.vessel} t={t} />
      <RoadRow road={shipment.road} />

      <div
        style={{
          marginTop: 8,
          background: "var(--phoenix-body-secondary-bg)",
          borderRadius: 4,
          overflow: "hidden",
          height: 4,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: barColor,
            borderRadius: 4,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 10,
          color: "var(--phoenix-body-tertiary-color)",
        }}
      >
        <span>
          {t("map.progress")} : <strong>{progress}%</strong>
        </span>
        <span>
          {t("map.eta")} :{" "}
          <strong>{formatDate(shipment.estimated_arrival)}</strong>
        </span>
      </div>
    </div>
  );
};

export default ShipmentPopup;