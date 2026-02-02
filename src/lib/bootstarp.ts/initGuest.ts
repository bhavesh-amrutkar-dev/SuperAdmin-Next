"use client";

import { getCookie, setCookie } from "cookies-next";
import { GuestService } from "../services/guest";

export async function initGuest() {
  const token = getCookie("token");

  if (token) return;

  try {
    const res = await GuestService.initGuest();

    const accessToken = res?.data?.token?.accessToken;
    const sid = res?.data?.sid;

    if (accessToken) {
      setCookie("token", accessToken, { path: "/" });
    }

    if (sid) {
      setCookie("sid", sid, { path: "/" });
    }
  } catch (err) {
    console.error("Guest init failed", err);
  }
}
