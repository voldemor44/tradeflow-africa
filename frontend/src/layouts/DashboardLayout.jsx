import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import NavbarConfigurator from "../components/NavbarConfigurator";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SupportChat from "../components/SupportChat"
import { useStateContext } from "../contexts/ContextProvider";
import { jwtDecode } from "jwt-decode";

const DashboardLayout = () => {
  const { token, setToken, setRefreshToken } = useStateContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialiser feather icons après le rendu
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    const tokenExpiration = jwtDecode(token).exp * 1000;
    if (Date.now() > tokenExpiration) {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      localStorage.removeItem("USER_ID");
      setToken(null);
      setRefreshToken(null);
      navigate("/login", { state: { from: location }, replace: true });
      return;
      // return window.location.href = "/login"
    }
  }, [token, navigate, location, setToken, setRefreshToken]);
  if (token) {
    return (
      <>
        <NavbarConfigurator />
        <main className="main" id="top">
          <Navbar />
          <div className="content">
            <Outlet />

            <Footer />
          </div>

          <SupportChat />
        </main>
      </>
    );
  }
};

export default DashboardLayout;
