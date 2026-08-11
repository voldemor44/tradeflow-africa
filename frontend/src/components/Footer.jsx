import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer position-absolute">
      <div className="row g-0 justify-content-between align-items-center h-100">
        <div className="col-12 col-sm-auto text-center">
          <p className="mb-0 mt-2 mt-sm-0 text-body">
            {t("app.slogan")}
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
          <p className="mb-0 text-body-tertiary text-opacity-85">{t("app.version")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
