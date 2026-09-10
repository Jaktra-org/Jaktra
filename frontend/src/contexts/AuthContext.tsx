import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/api";
import { authService } from "../services/auth";
import { authEvents } from "../services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      setUser(null);
      navigate("/login");
    };
    authEvents.addEventListener("unauthorized", handler);
    return () => authEvents.removeEventListener("unauthorized", handler);
  }, [navigate]);

  useEffect(() => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) {
      setIsLoading(true);
      authService
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token invalid or expired
          if (typeof localStorage !== "undefined") {
            localStorage.removeItem("auth_token");
          }
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
