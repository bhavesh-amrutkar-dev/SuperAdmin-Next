"use client";

import { useEffect } from "react";
import { initGuest } from "../lib/bootstrap/initGuest";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initGuest();
  }, []);

  return <>{children}</>;
}
