import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import RegisterEmail from "./features/auth/RegisterEmail";
import Profiles from "./features/organizer/Profiles";
import ProfilesUser from "./features/user/ProfilesUser";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/register-email" element={<RegisterEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRole="organizer" />}>
            <Route path="/organizer/profiles" element={<Profiles />} />
          </Route>
          <Route element={<RoleRoute allowedRole="participant" />}>
            <Route path="/user/profiles" element={<ProfilesUser />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
