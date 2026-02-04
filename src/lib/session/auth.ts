// lib/auth/session.ts
import { AuthSession } from "@/src/models/api/response/auth";
import { setCookie } from "cookies-next";

export function persistAuthSession(session: AuthSession) {
  setCookie("access_token", session.accessToken, {
    path: "/",
    sameSite: "lax",
  });

  setCookie("refresh_token", session.refreshToken, {
    path: "/",
    sameSite: "lax",
  });

  setCookie("access_exp", session.accessExpireAt, {
    path: "/",
  });
}
