// lib/hooks/useProfile.ts
"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/src/lib/services/auth";
import { IUserDTO } from "@/src/models/api/response/auth";

export function useProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    AuthService.getCurrentUser()
      .then((res) => {
        setUser(res?.data);
      })
      .catch(() => {
        console.warn("Failed to load profile");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { user, loading, refetch };
}
