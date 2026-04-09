import { createContext, useContext, useEffect, useState } from "react";

import { AUTH_EXPIRED_EVENT, getStoredAuthToken } from "../services/api.js";
import {
  getCurrentUser,
  login,
  loginWithGoogle,
  logoutUser,
  signup
} from "../services/authService.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getStoredAuthToken();

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (_error) {
        logoutUser();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    const handleExpiredAuth = () => {
      logoutUser();
      setUser(null);
      setAuthLoading(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);
    };
  }, []);

  const value = {
    user,
    authLoading,
    isAuthenticated: Boolean(user),
    signup: async (payload) => {
      const nextUser = await signup(payload);
      setUser(nextUser);
      return nextUser;
    },
    login: async (payload) => {
      const nextUser = await login(payload);
      setUser(nextUser);
      return nextUser;
    },
    loginWithGoogle: async (credential) => {
      const nextUser = await loginWithGoogle(credential);
      setUser(nextUser);
      return nextUser;
    },
    logout: () => {
      logoutUser();
      setUser(null);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
