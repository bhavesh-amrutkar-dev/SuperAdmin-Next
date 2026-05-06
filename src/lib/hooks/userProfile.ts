// lib/hooks/useProfile.ts
"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/src/lib/services/auth";
import { IUserDTO } from "@/src/models/api/response/auth";

export function useProfile({ enabled = true } = {}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    AuthService.getCurrentUser()
      .then((res) => {
        setUser(res?.data);
      })
      .catch(() => {
        console.warn("Failed to load profile");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
