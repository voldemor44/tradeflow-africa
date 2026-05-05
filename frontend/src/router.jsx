import { createBrowserRouter } from "react-router-dom";
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
import ShipmentDetailPage from "./views/ShipmentDetailPage ";
import ShipmentDocumentsPage from "./views/ShipmentDocumentsPage";

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
            path: "/expeditions/:id",
            element: <ShipmentDetailPage />,
          },
          {
            path: "/tracking/carte",
            element: <TrackingMapPage />,
          },
          {
            path: "/documents/list",
            element: <DocumentsPage />,
          },
          {
            path: "/documents/",
            element: <ShipmentDocumentsPage />,
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
