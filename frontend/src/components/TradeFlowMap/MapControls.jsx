// ─── Boutons de contrôle de la carte ─────────────────────────

const CONTROL_COLORS = {
  defaultBackground: "rgba(255,255,255,0.95)",
  hoverBackground: "#0d6efd",
  defaultColor: "#444",
  hoverColor: "#fff",
};

const handleMouseEnter = (e) => {
  e.currentTarget.style.background = CONTROL_COLORS.hoverBackground;
  e.currentTarget.style.color = CONTROL_COLORS.hoverColor;
};

const handleMouseLeave = (e) => {
  e.currentTarget.style.background = CONTROL_COLORS.defaultBackground;
  e.currentTarget.style.color = CONTROL_COLORS.defaultColor;
};

const MapControls = ({ controls }) => (
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
    {controls.map(({ onClick, icon, title }) => (
      <button
        key={title}
        onClick={onClick}
        title={title}
        aria-label={title}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          border: "none",
          background: CONTROL_COLORS.defaultBackground,
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: CONTROL_COLORS.defaultColor,
          fontSize: 13,
          transition: "background .15s, color .15s",
        }}
      >
        <span className={`fa-solid ${icon}`} />
      </button>
    ))}
  </div>
);

export default MapControls;