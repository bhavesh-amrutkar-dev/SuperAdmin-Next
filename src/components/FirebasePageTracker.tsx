"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackFirebaseEvent } from "../lib/firebase";

export default function FirebasePageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackFirebaseEvent("page_view", {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}