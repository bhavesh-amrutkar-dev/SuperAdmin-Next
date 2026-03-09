"use client";

import { getCookie, setCookie } from "cookies-next";
import { GuestService } from "../services/guest";

export async function initGuest() {
  const accessToken = getCookie("access_token");
  const guestToken = getCookie("token");

  if (accessToken || guestToken) return;

  try {
    const res = await GuestService.initGuest();

    const accessToken = res?.data?.token?.accessToken;
    const sid = res?.data?.sid;

    if (accessToken) {
      setCookie("token", accessToken, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (sid) {
      setCookie("sid", sid, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch (err) {
    console.warn("Guest init failed", err);
  }
}

