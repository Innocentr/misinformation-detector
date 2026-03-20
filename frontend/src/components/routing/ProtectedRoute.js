import { Navigate, useLocation } from "react-router-dom";
import { hasActiveSession } from "../../lib/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!hasActiveSession()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
