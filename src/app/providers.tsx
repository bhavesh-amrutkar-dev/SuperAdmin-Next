// app/providers.tsx
"use client";

import { AuthProvider } from "@/src/context/authContext";
import { Toaster } from "sonner";
import CountryGuard from "./CountryGaurd";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CountryGuard>
        <Toaster position="top-center" richColors closeButton />
        {children}
      </CountryGuard>
    </AuthProvider>
  );
}
