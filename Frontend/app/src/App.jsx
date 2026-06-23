import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import { Loading } from "./components/index.js";
import RouteLoader from "./components/Loader.jsx";

import Landing from "./surfaces/Landing.jsx";
import Login from "./surfaces/admin/Login.jsx";
import AdminLayout from "./surfaces/admin/AdminLayout.jsx";
import Kiosk from "./surfaces/kiosk/Kiosk.jsx";
import Registration from "./surfaces/registration/Registration.jsx";
import PortalLayout from "./surfaces/portal/PortalLayout.jsx";

function RequireAuth({ children }) {
  const { isAuthed, booting } = useAuth();
  const loc = useLocation();
  if (booting) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><Loading label="Restoring session…" /></div>;
  if (!isAuthed) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <>
      <RouteLoader />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin/*" element={<RequireAuth><AdminLayout /></RequireAuth>} />

      {/* Field + station surfaces — operated by a signed-in polling/registration
          officer (voter lookup, stations and officers all require a bearer token). */}
      <Route path="/kiosk" element={<RequireAuth><Kiosk /></RequireAuth>} />
      <Route path="/register" element={<RequireAuth><Registration /></RequireAuth>} />

      <Route path="/portal/*" element={<PortalLayout />} />

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
