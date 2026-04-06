import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const storedUser =
    localStorage.getItem("worklinkUser") || localStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;