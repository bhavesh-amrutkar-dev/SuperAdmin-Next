// app/providers.tsx
"use client";

import { AuthProvider } from "@/src/context/authContext";
import { Toaster } from "sonner";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors closeButton />
      {children}
    </AuthProvider>
  );
}
