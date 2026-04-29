import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import TradeFlowDashboard from "./views/TradeFlowDashboard";
import ExpeditionsPage from "./views/ExpeditionsPage";
import Register from "./views/auth/Register";
import DefaultLayout from "./layouts/DefaultLayout";
import GuestLayout from "./layouts/GuestLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/auth/Login";
import TravelAgencyDash from "./views/TravelAgencyDash";
import TrackingMapPage from "./views/TrackingMapPage";
import DocumentsPage from "./views/DocumentsPage";
import NotFoundPage from "./views/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    errorElement: "",
    children: [
      {
        path: "/",
        element: <GuestLayout />,
        children: [
          { path: "/register", element: <Register /> },
          { path: "/login", element: <Login /> },
        ],
      },
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <TradeFlowDashboard />,
          },
          {
            path: "/expeditions",
            element: <ExpeditionsPage />,
          },
          {
            path: "/tracking/carte",
            element: <TrackingMapPage />,
          },
          {
            path: "/documents/list",
            element: <DocumentsPage />,
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
