// components/AirbridgeProvider.tsx
"use client";

import { useEffect, PropsWithChildren } from "react";
import { initAirbridge } from "../lib/airbridge";

export default function AirbridgeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    initAirbridge();
  }, []);

  return <>{children}</>;
}