import { useEffect } from "react";

function NavbarConfigurator() {
  useEffect(() => {
    const navbarTopShape = window.config?.config?.phoenixNavbarTopShape;
    const navbarPosition = window.config?.config?.phoenixNavbarPosition;
    const navbarTopStyle = window.config?.config?.phoenixNavbarTopStyle;
    const navbarVerticalStyle =
      window.config?.config?.phoenixNavbarVerticalStyle;

    const documentElement = document.documentElement;

    // Configuration de la navigation
    if (navbarPosition === "dual-nav") {
      documentElement.setAttribute("data-navigation-type", "dual");
    } else if (navbarTopShape === "slim" && navbarPosition === "vertical") {
      documentElement.setAttribute("data-navbar-horizontal-shape", "slim");
    } else if (navbarTopShape === "slim" && navbarPosition === "horizontal") {
      documentElement.setAttribute("data-navbar-horizontal-shape", "slim");
    } else if (navbarTopShape === "slim" && navbarPosition === "combo") {
      documentElement.setAttribute("data-navbar-horizontal-shape", "slim");
    } else if (
      navbarTopShape === "default" &&
      navbarPosition === "horizontal"
    ) {
      documentElement.setAttribute("data-navigation-type", "horizontal");
    } else if (navbarTopShape === "default" && navbarPosition === "combo") {
      documentElement.setAttribute("data-navigation-type", "combo");
    }

    // Styles navbar
    const navbarTop = document.querySelector(".navbar-top");
    if (navbarTopStyle === "darker" && navbarTop) {
      navbarTop.setAttribute("data-navbar-appearance", "darker");
    }

    const navbarVertical = document.querySelector(".navbar-vertical");
    if (navbarVerticalStyle === "darker" && navbarVertical) {
      navbarVertical.setAttribute("data-navbar-appearance", "darker");
    }
  }, []);

  return null; // Ce composant ne rend rien
}

export default NavbarConfigurator;
