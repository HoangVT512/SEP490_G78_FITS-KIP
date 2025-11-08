import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spin } from "antd";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireTeamLeader = false,
  requireTechnician = false,
  requireTechnicianManager = false,
  requireManager = false,
  requireWarehouseManager = false,
  redirectTo = "/login",
}) => {
  const {
    isAuthenticated,
    loading,
    isAdmin,
    isTeamLeader,
    isTechnician,
    isTechnicianManager,
    isManager,
    isWarehouseManager,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user account is active
  if (user && user.isActive === false) {
    return <Navigate to="/login?inactive=true" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/team-leader" replace />;
  }

  if (requireTeamLeader && !isTeamLeader()) {
    return <Navigate to="/admin" replace />;
  }

  if (requireTechnician && !isTechnician()) {
    return <Navigate to="/login" replace />;
  }

  if (requireTechnicianManager && !isTechnicianManager()) {
    return <Navigate to="/login" replace />;
  }

  if (requireManager && !isManager()) {
    return <Navigate to="/login" replace />;
  }

  if (requireWarehouseManager && !isWarehouseManager()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
