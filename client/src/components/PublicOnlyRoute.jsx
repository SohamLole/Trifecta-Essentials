import { Navigate } from "react-router-dom";

import Loader from "./Loader.jsx";
import { useAuth } from "./AuthProvider.jsx";

const PublicOnlyRoute = ({ children }) => {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <Loader label="Preparing SnapSense..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
