// lib/auth/session.ts
import { AuthSession } from "@/src/models/api/response/auth";
import { setCookie, deleteCookie } from "cookies-next";

export function persistAuthSession(session: AuthSession) {
  if (!session?.accessToken) return;

  deleteCookie("token", { path: "/" });
  deleteCookie("access_token", { path: "/" });
  deleteCookie("refresh_token", { path: "/" });
  deleteCookie("access_exp", { path: "/" });
  deleteCookie("uid", { path: "/" });

  setCookie("access_token", session.accessToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  setCookie("token", session.accessToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 day
  });

  setCookie("refresh_token", session.refreshToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  setCookie("access_exp", session.accessExpireAt, {
    path: "/",
  });

  setCookie("user_name", session.name, { path: "/" });
  setCookie("profile_pic", session.profilePic || "", { path: "/" });

  if (session.userId) {
    setCookie("uid", session.userId, {
      path: "/",
      sameSite: "lax",
    });
  }
}
