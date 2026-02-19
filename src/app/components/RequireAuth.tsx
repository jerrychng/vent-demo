import React, { useContext } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireAuth: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const authenticationContext = useContext(AuthContext);
  const location = useLocation();

  // if provider not mounted, treat as unauthenticated
  if (!authenticationContext)
    return <Navigate to="/login" state={{ from: location }} replace />;

  const { user, loading } = authenticationContext;

  if (loading) {
    return null;
  }

  // require either a persisted token or an in-memory user
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If children provided, render them; otherwise render nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default RequireAuth;
