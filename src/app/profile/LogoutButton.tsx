"use client";

import { logout as logoutUser } from "@/src/lib/utils/logout";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/auth/login-mobile");
  };

  return (
    <button
      onClick={handleLogout}
      className="border px-4 py-2 rounded-md text-red-600"
    >
      Logout
    </button>
  );
}
