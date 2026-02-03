import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center">
        <main className="w-full max-w-md px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
