import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (path == "/") {
      navigate("/login");
    }
  }, []);
  return (
    <>
      <Outlet />
    </>
  );
};

export default DefaultLayout;
