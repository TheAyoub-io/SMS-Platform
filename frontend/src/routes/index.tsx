import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

// Placeholder for the dashboard
const Dashboard = () => <div>Dashboard Page</div>;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/",
    element: <LoginPage />, // Default to login page
  },
]);
