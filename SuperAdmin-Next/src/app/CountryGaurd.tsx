"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { COUNTRY_CODE } from "@/src/lib/config";
import CountrySelectorModal from "../components/layout/CountrySelectorModal";

export default function CountryGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const country = getCookie(COUNTRY_CODE);

    if (!country) {
      setOpen(true);
    }
  }, []);

  return (
    <>
      {children}
      <CountrySelectorModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
