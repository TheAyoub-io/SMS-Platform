import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import CampaignsPage from "../pages/CampaignsPage";
import ContactsPage from "../pages/ContactsPage";
import UsersPage from "../pages/UsersPage";
import TemplatesPage from "../pages/TemplatesPage";
import SettingsPage from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "campaigns",
            element: <CampaignsPage />,
          },
          {
            path: "contacts",
            element: <ContactsPage />,
          },
          {
            path: "templates",
            element: <TemplatesPage />,
          },
          {
            path: "users",
            element: (
              <ProtectedRoute allowedRoles={["admin"]} />
            ),
            children: [
              {
                path: "",
                element: <UsersPage />,
              },
            ],
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            // Redirect from root to dashboard if logged in
            path: "",
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
]);
