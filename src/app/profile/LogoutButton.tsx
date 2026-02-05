"use client";

import { initGuest } from "@/src/lib/bootstrap/initGuest";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("token")
    initGuest();
    router.replace("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="border px-4 py-2 rounded-md text-red-600"
    >
      Logout
    </button>
  );
}
