"use client";

import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    deleteCookie("access_token");
    deleteCookie("refresh_token");

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
