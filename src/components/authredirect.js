import { Navigate } from "react-router-dom";

function AuthRedirect({ children }) {
  const storedUser =
    localStorage.getItem("worklinkUser") || localStorage.getItem("user");

  if (storedUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AuthRedirect;