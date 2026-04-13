import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const storedUser =
    localStorage.getItem("worklinkUser") || localStorage.getItem("user");

  // Handle invalid values
  if (!storedUser || storedUser === "undefined" || storedUser === "null") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;