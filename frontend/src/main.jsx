// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import router from "./router.jsx";
import { RouterProvider } from "react-router";
import { ContextProvider } from "./contexts/ContextProvider.jsx";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContextProvider>
      <RouterProvider router={router} />
    </ContextProvider>
  </React.StrictMode>,
);
