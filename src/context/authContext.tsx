"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthSession } from "../models/api/response/auth";
import { initGuest } from "../lib/bootstrap/initGuest";
import { getCookie } from "cookies-next";

type AuthContextType = {
  user: AuthSession | null;
  setUser: (u: AuthSession | null) => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initGuest();

        // 🔥 Hydrate user from cookies if token exists
        const token = getCookie("access_token");
        const uid = getCookie("uid");

        if (token && uid) {
          setUser((prev) =>
            prev ?? {
              userId: uid as string,
              accessToken: token as string,
            } as AuthSession
          );
        }

      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
