import React from "react";
import { useAuthStore } from "@/store";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const loggedIn = useAuthStore((state) => state.isLoggedIn);
  console.log(loggedIn);

  // if logged is false reroute to the login page
  if (!loggedIn) {
    return <Navigate to="/login" />;
  }
  // else render the protected page
  return children;
};

export default ProtectedRoute;
