"use client";

import { getCookie } from "cookies-next";
import { DEFAULT_COUNTRY_CODE, DEFAULT_LANGUAGE } from "../config";

export const getCommonHeaders = () => {
  const currencyCode = (getCookie("currencyCode") as string) || "USD";
  const currencySymbol = (getCookie("currencySymbol") as string) || "$";
  const language = (getCookie("NEXT_LOCALE") as string) || DEFAULT_LANGUAGE;
  const token = getCookie("token") as string | undefined;
  const country = (getCookie("C_code") as string) ||  DEFAULT_COUNTRY_CODE;

  return {
    "Content-Type": "application/json",
    language,
    currencycode: currencyCode ,
    currencysymbol: btoa(currencySymbol),
    platform: "3",
    country,
    ...(token ? { Authorization: token } : {}),
  };
};
