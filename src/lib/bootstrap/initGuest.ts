"use client";

import { getCookie, setCookie } from "cookies-next";
import { GuestService } from "../services/guest";

export async function initGuest() {
  const accessToken = getCookie("access_token");
  const guestToken = getCookie("token");

  if (accessToken || guestToken) return;

  try {
    const res = await GuestService.initGuest();

    const data = res?.data;

    const accessToken = data?.token?.accessToken;
    const sid = data?.sid;

    const countryCode = data?.countryDetails?.countryCode || data?.country;
    const currencyCode = data?.countryDetails?.currencyShortCode;
    const currencySymbol = data?.countryDetails?.currencySymbol;
    const countryId = data?.countryDetails?._id;

    const cookieOptions = {
      path: "/",
      sameSite: "none" as const,
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
    };

    if (accessToken) {
      setCookie("token", accessToken, cookieOptions);
    }

    if (sid) {
      setCookie("sid", sid, cookieOptions);
    }

    /* ✅ NEW */
    if (countryCode) {
      setCookie("C_code", countryCode, cookieOptions);
    }

    if (currencyCode) {
      setCookie("currencyCode", currencyCode, cookieOptions);
    }

    if (currencySymbol) {
      setCookie("currencySymbol", currencySymbol, cookieOptions);
    }

    if (countryId) {
      setCookie("C_id", countryId, cookieOptions);
    }

  } catch (err) {
    console.warn("Guest init failed", err);
  }
}