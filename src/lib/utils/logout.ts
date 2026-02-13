"use client";

import { deleteCookie } from "cookies-next";
import { initGuest } from "../bootstrap/initGuest";

/**
 * Shared logout utility function
 * Clears all authentication cookies and initializes guest session
 */
export async function logout() {
  try {
    
    deleteCookie("access_token", { path: "/" });
    deleteCookie("refresh_token", { path: "/" });
    deleteCookie("token", { path: "/" });
    deleteCookie("access_exp", { path: "/" });
    deleteCookie("sid", { path: "/" });
    deleteCookie("uid", { path: "/" });

    // Optional: if you store these
    deleteCookie("user_name", { path: "/" });
    deleteCookie("profile_pic", { path: "/" });

    // Notify app (optional but recommended)
    window.dispatchEvent(new Event("userLoggedOut"));

    // Reinitialize guest session
    await initGuest();
  } catch (error) {
    console.warn("Logout error:", error);
  }
}
