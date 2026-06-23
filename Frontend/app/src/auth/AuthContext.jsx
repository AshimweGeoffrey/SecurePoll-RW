import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore, setAuthLostHandler } from "../api/client.js";
import { auth as authApi, users, roles as rolesApi } from "../api/endpoints.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [booting, setBooting] = useState(true);
  // After login when MFA is required we hold here until the code is entered.
  const [mfaPending, setMfaPending] = useState(false);

  const loadProfile = useCallback(async () => {
    const me = await users.me();
    setUser(me);
    try {
      setRoles(await rolesApi.list());
    } catch {
      /* roles are non-critical for rendering */
    }
    return me;
  }, []);

  // On mount: if we already hold a full token, restore the session.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (tokenStore.get()) {
        try {
          await loadProfile();
        } catch {
          tokenStore.clear();
        }
      }
      if (alive) setBooting(false);
    })();
    return () => {
      alive = false;
    };
  }, [loadProfile]);

  // Centralized 401 handler — drop the session.
  useEffect(() => {
    setAuthLostHandler(() => {
      tokenStore.clear();
      setUser(null);
      setMfaPending(false);
    });
  }, []);

  // Step 1: email + password. Returns {mfaRequired} so the UI can branch.
  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.mfa_required) {
      tokenStore.setPartial(res.access_token);
      setMfaPending(true);
      return { mfaRequired: true };
    }
    tokenStore.set(res.access_token);
    tokenStore.setPartial("");
    await loadProfile();
    return { mfaRequired: false };
  }, [loadProfile]);

  // Step 2: TOTP code (only when MFA was required).
  const completeMfa = useCallback(async (code) => {
    const res = await authApi.mfa(code);
    tokenStore.set(res.access_token);
    tokenStore.setPartial("");
    setMfaPending(false);
    await loadProfile();
    return res;
  }, [loadProfile]);

  const resendOtp = useCallback(() => authApi.resendOtp(), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* best effort */
    }
    tokenStore.clear();
    setUser(null);
    setMfaPending(false);
  }, []);

  const role = useMemo(
    () => roles.find((r) => r.id === user?.role_id) || null,
    [roles, user]
  );

  // Super admin implicitly holds every permission.
  const permissions = useMemo(() => {
    if (!user) return new Set();
    if (user.role_id === "super") return new Set(["registry", "verify", "fraud", "audit", "users", "keys"]);
    return new Set(role?.permissions || []);
  }, [user, role]);

  const can = useCallback((perm) => permissions.has(perm), [permissions]);

  const value = {
    user, role, roles, permissions, can,
    booting, mfaPending,
    isAuthed: !!user,
    login, completeMfa, resendOtp, logout, reload: loadProfile,
    cancelMfa: () => {
      tokenStore.clear();
      setMfaPending(false);
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
