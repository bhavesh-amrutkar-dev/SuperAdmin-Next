"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OpenDeepLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams?.get("donrifa_type");
    const id = searchParams?.get("donrifa_id");
    const parentId = searchParams?.get("donrifa_parent_id");

    if (!type || !id) {
      router.replace("/");
      return;
    }

    switch (type) {
      case "raffle":
        // Navigate to raffle detail page
        router.replace(`/raffles/${id}?pid=${id}`);
        break;

      case "invite":
        router.replace(`/`);
        break;

      case "merchandise":
        router.replace(`/`);
        break;

      default:
        router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}