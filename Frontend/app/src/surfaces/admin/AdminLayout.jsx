import { useState } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShieldAlert, Users, FileCheck2, BarChart3, KeyRound, Lock,
  ScanFace, MapPin, Cpu, Settings, Menu,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Avatar } from "../../components/index.js";
import { Brand } from "../../components/Brand.jsx";
import { NotifBell } from "./Notifications.jsx";
import { SettingsModal, SettingsPanel } from "./Settings.jsx";
import "./admin.css";

import Dashboard from "./pages/Dashboard.jsx";
import Registry from "./pages/Registry.jsx";
import VerificationLog from "./pages/VerificationLog.jsx";
import Fraud from "./pages/Fraud.jsx";
import Audit from "./pages/Audit.jsx";
import Geography from "./pages/Geography.jsx";
import Reporting from "./pages/Reporting.jsx";
import AiModels from "./pages/AiModels.jsx";
import UsersRoles from "./pages/UsersRoles.jsx";
import Encryption from "./pages/Encryption.jsx";

// perm: null = always visible. Otherwise gated on a permission key.
const NAV = [
  { grp: "Monitor", items: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, perm: null },
    { to: "/admin/verification", label: "Verification", icon: ScanFace, perm: "verify" },
    { to: "/admin/fraud", label: "Fraud detection", icon: ShieldAlert, perm: "fraud" },
  ]},
  { grp: "Manage", items: [
    { to: "/admin/registry", label: "Voter registry", icon: Users, perm: "registry" },
    { to: "/admin/geography", label: "Geography & ops", icon: MapPin, perm: null },
    { to: "/admin/audit", label: "Audit log", icon: FileCheck2, perm: "audit" },
  ]},
  { grp: "Analyze", items: [
    { to: "/admin/reporting", label: "Reporting", icon: BarChart3, perm: null },
    { to: "/admin/ai", label: "AI & models", icon: Cpu, perm: null },
  ]},
  { grp: "Govern", items: [
    { to: "/admin/users", label: "Users & roles", icon: KeyRound, perm: "users" },
    { to: "/admin/encryption", label: "Encryption", icon: Lock, perm: "keys" },
  ]},
];

function Sidebar({ open, onNavigate, onOpenSettings }) {
  const { user, role, can } = useAuth();
  return (
    <aside className={"side" + (open ? " side--open" : "")}>
      <Brand size={26} to="/" className="side__brand" />
      <nav className="side__nav">
        {NAV.map((g) => {
          const items = g.items.filter((it) => it.perm === null || can(it.perm));
          if (!items.length) return null;
          return (
            <div key={g.grp}>
              <div className="side__grp">{g.grp}</div>
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} onClick={onNavigate} className={({ isActive }) => "side__item" + (isActive ? " active" : "")}>
                  <it.icon size={17} /> {it.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
      <button className="side__user" style={{ cursor: "pointer", textAlign: "left", font: "inherit", background: "none" }} onClick={() => { onNavigate?.(); onOpenSettings("account"); }}>
        <Avatar name={user?.full_name} size={36} />
        <div style={{ minWidth: 0 }}>
          <div className="side__un">{user?.full_name || "—"}</div>
          <div className="side__ur">{role?.name || user?.role_id} {user?.mfa_enabled ? "· MFA" : ""}</div>
        </div>
      </button>
    </aside>
  );
}

function Topbar({ onBurger, onOpenSettings }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [panel, setPanel] = useState(false);
  const doLogout = async () => { setPanel(false); await logout(); navigate("/login", { replace: true }); };
  return (
    <header className="topbar">
      <button className="topbar__burger" aria-label="Open menu" onClick={onBurger}><Menu size={20} /></button>
      <div className="sp-grow" />
      <div className="topbar__end">
        <NotifBell onOpenSettings={onOpenSettings} />
        <div style={{ position: "relative" }}>
          <button className={"icon-btn" + (panel ? " on" : "")} aria-label="Settings" onClick={() => setPanel((m) => !m)}>
            <Settings size={18} />
          </button>
          {panel && (
            <SettingsPanel
              onClose={() => setPanel(false)}
              onOpen={(tab) => { setPanel(false); onOpenSettings(tab); }}
              onSignOut={doLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout() {
  const [drawer, setDrawer] = useState(false);
  const [settingsTab, setSettingsTab] = useState(null); // null = closed; else tab id

  return (
    <div className="admin">
      <Sidebar open={drawer} onNavigate={() => setDrawer(false)} onOpenSettings={setSettingsTab} />
      {drawer && <div className="admin__scrim" onClick={() => setDrawer(false)} />}
      <div className="main">
        <Topbar onBurger={() => setDrawer(true)} onOpenSettings={setSettingsTab} />
        <div className="content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="verification" element={<VerificationLog />} />
            <Route path="fraud" element={<Fraud />} />
            <Route path="registry" element={<Registry />} />
            <Route path="geography" element={<Geography />} />
            <Route path="audit" element={<Audit />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="ai" element={<AiModels />} />
            <Route path="users" element={<UsersRoles />} />
            <Route path="encryption" element={<Encryption />} />
            {/* settings is a modal, not a page — redirect any old links */}
            <Route path="settings" element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>

      {settingsTab && <SettingsModal tab={settingsTab} setTab={setSettingsTab} onClose={() => setSettingsTab(null)} />}
    </div>
  );
}
