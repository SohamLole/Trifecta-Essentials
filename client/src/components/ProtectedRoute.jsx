import { Navigate, useLocation } from "react-router-dom";

import Loader from "./Loader.jsx";
import { useAuth } from "./AuthProvider.jsx";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <Loader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
