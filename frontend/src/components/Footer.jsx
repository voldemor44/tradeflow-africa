import React from "react";

const Footer = () => {
  return (
    <footer className="footer position-absolute">
      <div className="row g-0 justify-content-between align-items-center h-100">
        <div className="col-12 col-sm-auto text-center">
          <p className="mb-0 mt-2 mt-sm-0 text-body">
            Gestionnaire d'activités Import-Export
            <span className="d-none d-sm-inline-block" />
            <span className="d-none d-sm-inline-block mx-1">|</span>
            <br className="d-sm-none" />
            2025 ©
            <a className="mx-1" href="https://themewagon.com/">
              TradeFlow
            </a>
          </p>
        </div>
        <div className="col-12 col-sm-auto text-center">
          <p className="mb-0 text-body-tertiary text-opacity-85">v1.23.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
