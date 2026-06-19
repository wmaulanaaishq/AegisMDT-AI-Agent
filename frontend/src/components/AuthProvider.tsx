"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  subscription_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const storedToken = localStorage.getItem("aegis_token");
    const storedUser = localStorage.getItem("aegis_user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Optionally refresh user from backend
      refreshUser(storedToken);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = async (currentToken: string | null = token) => {
    if (!currentToken) return;
    try {
      const res = await fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("aegis_user", JSON.stringify(data.user));
      } else {
        // Token invalid
        logout();
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (username: string, newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("aegis_token", newToken);
    localStorage.setItem("aegis_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("aegis_token");
    localStorage.removeItem("aegis_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
