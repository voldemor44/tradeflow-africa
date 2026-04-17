import React from "react";
import { Outlet } from "react-router";

const GuestLayout = () => {
  return (
    <main className="main" id="top">
      <div className="container-fluid bg-body-tertiary dark__bg-gray-1200">
        <div
          className="bg-holder bg-auth-card-overlay"
          style={{ backgroundImage: "url(/assets/img/bg/37.png)" }}
        />
        <Outlet />
      </div>
    </main>
  );
};

export default GuestLayout;
