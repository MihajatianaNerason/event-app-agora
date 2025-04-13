import {
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Section } from "./components/Section";
import RegisterEmail from "./features/auth/RegisterEmail";
import VerifyEmail from "./features/auth/VerifyEmail";
import Profiles from "./features/organizer/Profiles";
import CreateEvents from "./features/organizer/views/CreateEvents";
import Dashboard from "./features/organizer/views/Dashboard";
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
        <Route path="/auth/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <Section>
                <Navbar />
                <div className="container mx-auto px-4 py-6">
                  <Outlet />
                </div>
              </Section>
            }
          >
            <Route element={<RoleRoute allowedRole="organizer" />}>
              <Route path="/organizer/profiles" element={<Profiles />} />
              <Route path="/organizer/dashboard" element={<Dashboard />} />
              <Route
                path="/organizer/events/create"
                element={<CreateEvents />}
              />
            </Route>
            <Route element={<RoleRoute allowedRole="participant" />}>
              <Route path="/user/profiles" element={<ProfilesUser />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
