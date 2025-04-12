import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "./hooks/useSession";
import { useUsers } from "./hooks/useUser";

interface RoleRouteProps {
  allowedRole: "participant" | "organizer";
  children?: React.ReactNode;
}

const RoleRoute = ({ allowedRole, children }: RoleRouteProps) => {
  const { data: currentSession } = useSession();
  const { data: users } = useUsers(currentSession?.session?.user.id);
  const userRole = users?.[0]?.role;

  if (userRole !== allowedRole) {
    return (
      <Navigate
        to={userRole === "organizer" ? "/organizer/profiles" : "/user/profiles"}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;
