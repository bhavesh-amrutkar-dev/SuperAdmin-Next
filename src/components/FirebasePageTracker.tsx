"use client";
 
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackFirebaseEvent } from "../lib/firebase";
 
export default function FirebasePageTracker() {
  const pathname = usePathname();
 
  useEffect(() => {
    const track = async () => {
      // 🔥 Use custom event first to verify
      await trackFirebaseEvent("page_view", {
        page_path: pathname,
      });
    };
 
    track();
  }, [pathname]);
 
  return null;
}