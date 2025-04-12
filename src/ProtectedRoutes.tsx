import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./features/auth/useAuth";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { userStatus } = useAuth();
  const accessToken = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (userStatus === "signed-out" && (!accessToken || !refreshToken)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
