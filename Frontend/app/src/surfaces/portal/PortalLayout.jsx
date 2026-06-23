import { Routes, Route, Navigate } from "react-router-dom";
import PublicPortal from "./PortalHome.jsx";
import CheckStatus from "./CheckStatus.jsx";
import ReportIncident from "./ReportIncident.jsx";
import ObserverLogin from "./ObserverLogin.jsx";
import ObserverRegister from "./ObserverRegister.jsx";
import ObserverDashboard from "./ObserverDashboard.jsx";
import "./portal.css";

export default function PortalLayout() {
  return (
    <Routes>
      <Route index element={<PublicPortal />} />
      <Route path="status" element={<CheckStatus />} />
      <Route path="incident" element={<ReportIncident />} />
      <Route path="observer-login" element={<ObserverLogin />} />
      <Route path="observer-register" element={<ObserverRegister />} />
      <Route path="observer" element={<ObserverDashboard />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}
