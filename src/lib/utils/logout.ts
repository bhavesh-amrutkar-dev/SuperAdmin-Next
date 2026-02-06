"use client";

import { deleteCookie } from "cookies-next";
import { initGuest } from "../bootstrap/initGuest";

/**
 * Shared logout utility function
 * Clears all authentication cookies and initializes guest session
 */
export async function logout() {
    // Clear all authentication-related cookies
    deleteCookie("access_token", { path: "/" });
    deleteCookie("refresh_token", { path: "/" });
    deleteCookie("token", { path: "/" });
    deleteCookie("access_exp", { path: "/" });
    deleteCookie("sid", { path: "/" });

    // Initialize guest session
    await initGuest();
}

