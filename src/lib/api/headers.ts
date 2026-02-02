"use client";

import { getCookie } from "cookies-next";

export const getCommonHeaders = () => {
  const currencyCode = String(getCookie("currencyCode") ?? "USD");
  const currencySymbol = String(getCookie("currencySymbol") ?? "$");
  const language = String(getCookie("language") ?? "en");
  const token = getCookie("token");

  return {
    "Content-Type": "application/json",
    "Language": language,
    currencycode: currencyCode,
    currencysymbol: btoa(currencySymbol),
    platform: "3",
    ...(token ? { Authorization: String(token) } : {}),
  };
};
