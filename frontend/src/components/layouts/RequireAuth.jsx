import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getSession } from "@/services/authService";

const RequireAuth = ({ children }) => {
  const { session } = useApp();
  const location = useLocation();

  if (!session && !getSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
