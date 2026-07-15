import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");

  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  const role =
    roles[0]?.roleName ||
    roles[0]?.name ||
    roles[0];

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}