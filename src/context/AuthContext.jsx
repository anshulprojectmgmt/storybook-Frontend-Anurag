import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_SESSION_INVALID_EVENT, apiRequest } from "../utils/api";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  saveAuthSession,
} from "../utils/authSession";

const AuthContext = createContext(null);

function createEmptySession() {
  return {
    token: "",
    user: null,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredAuthSession());

  const resetSession = () => {
    clearStoredAuthSession();
    setSession(createEmptySession());
  };

  const commitSession = (nextSession) => {
    if (!nextSession?.token || !nextSession?.user) {
      resetSession();
      return null;
    }

    saveAuthSession(nextSession);
    setSession(nextSession);
    return nextSession;
  };

  const signup = async (formData) => {
    const response = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: formData,
    });

    return commitSession({
      token: response.token,
      user: response.user,
    });
  };

  const login = async (formData) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    return commitSession({
      token: response.token,
      user: response.user,
    });
  };

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        token: session.token || undefined,
      });
    } catch {
      // Logging out should still clear local state if the API is unavailable.
    } finally {
      resetSession();
    }
  };

  const refreshUser = async () => {
    if (!session.token) {
      return null;
    }

    try {
      const response = await apiRequest("/api/auth/me", {
        token: session.token,
      });
      const nextSession = {
        token: session.token,
        user: response.user,
      };

      commitSession(nextSession);
      return response.user;
    } catch (error) {
      if (error.status === 401 || error.isAuthSessionInvalid) {
        resetSession();
      }

      return null;
    }
  };

  useEffect(() => {
    const handleInvalidSession = () => {
      resetSession();
    };

    window.addEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);

    return () => {
      window.removeEventListener(
        AUTH_SESSION_INVALID_EVENT,
        handleInvalidSession,
      );
    };
  }, []);

  useEffect(() => {
    if (session.token) {
      refreshUser();
    }
  }, []);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      logout,
      refreshUser,
      signup,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
