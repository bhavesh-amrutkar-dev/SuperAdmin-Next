// app/providers.tsx
"use client";

import { AuthProvider } from "@/src/context/authContext";
import { Toaster } from "sonner";
// import CountryGuard from "./CountryGaurd";
import { CountryProvider } from "@/src/context/countryContext";
import { CountryApiItem } from "@/src/lib/services/country";

export default function ClientProviders({
  children,
  countries,
}: {
  children: React.ReactNode;
  countries: CountryApiItem[];
}) {
  return (
    <AuthProvider>
      <CountryProvider countries={countries}>
        {/* <CountryGuard> */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          visibleToasts={4}
          toastOptions={{
            className:
              "rounded-2xl shadow-2xl border border-gray-200 backdrop-blur-lg",
            style: {
              padding: "16px",
              fontSize: "14px",
            },
          }}
        />
        {children}
        {/* </CountryGuard> */}
      </CountryProvider>
    </AuthProvider>
  );
}
