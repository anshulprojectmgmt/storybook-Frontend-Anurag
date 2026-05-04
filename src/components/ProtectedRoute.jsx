import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveAuthIntent } from "../utils/authIntent";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;

    saveAuthIntent({
      returnTo,
      action: "unlock",
    });

    return <Navigate to="/login" replace state={{ from: returnTo }} />;
  }

  return children;
}

export default ProtectedRoute;
