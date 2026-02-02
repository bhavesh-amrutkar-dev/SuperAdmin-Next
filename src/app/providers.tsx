"use client";

import { useEffect } from "react";
import { initGuest } from "../lib/bootstarp.ts/initGuest";

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
