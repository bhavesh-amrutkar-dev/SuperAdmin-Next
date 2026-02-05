// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { AuthSession } from "../models/api/response/auth";

type AuthContextType = {
  user: AuthSession | null;
  setUser: (u: AuthSession | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
