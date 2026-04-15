"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
   const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");

  if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-YRFMY9GL2H", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}