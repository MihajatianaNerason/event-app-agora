import EditProfile from "@/components/EditProfile";
import {
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import { Section } from "./components/Section";
import RegisterEmail from "./features/auth/RegisterEmail";
import VerifyEmail from "./features/auth/VerifyEmail";
import Profiles from "./features/organizer/Profiles";
import CreateEvents from "./features/organizer/views/CreateEvents";
import Dashboard from "./features/organizer/views/Dashboard";
import EditEvent from "./features/organizer/views/EditEvent";
import Stats from "./features/organizer/views/Stats";
import ProfilesUser from "./features/user/ProfilesUser";
import EventList from "./pages/EventList";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
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
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <Section>
                <Navbar />
                <div className="container mx-auto px-4 py-6">
                  <Outlet />
                </div>
                <ScrollToTop />
              </Section>
            }
          >
            <Route path="/events" element={<EventList />} />
            <Route element={<RoleRoute allowedRole="organizer" />}>
              <Route path="/organizer/profiles" element={<Profiles />} />
              <Route path="/organizer/dashboard" element={<Dashboard />} />
              <Route
                path="/organizer/events/create"
                element={<CreateEvents />}
              />
              <Route
                path="/organizer/events/edit/:id"
                element={<EditEvent />}
              />
              <Route path="/organizer/stats" element={<Stats />} />
              <Route path="/organizer/profile" element={<Profiles />} />
              <Route path="/organizer/profile/edit" element={<EditProfile />} />
            </Route>
            <Route element={<RoleRoute allowedRole="participant" />}>
              <Route path="/user/profiles" element={<ProfilesUser />} />
              <Route path="/profile" element={<ProfilesUser />} />
              <Route path="/profile/edit" element={<EditProfile />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
