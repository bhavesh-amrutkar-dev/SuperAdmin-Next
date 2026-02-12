// lib/auth/session.ts
import { AuthSession } from "@/src/models/api/response/auth";
import { setCookie, deleteCookie } from "cookies-next";

export function persistAuthSession(session: AuthSession) {
  // 1. Remove existing cookies
  deleteCookie("token", { path: "/" });
  deleteCookie("access_token", { path: "/" });
  deleteCookie("refresh_token", { path: "/" });
  deleteCookie("access_exp", { path: "/" });
  deleteCookie("uid", { path: "/" });

  // 2. Set new cookies
  setCookie("access_token", session.accessToken, {
    path: "/",
    sameSite: "lax",
  });
  setCookie("token", session.accessToken, {
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
  setCookie("user_name", session.name, { path: "/" });
  setCookie("profile_pic", session.profilePic || "", { path: "/" });


  // Set uid cookie for compatibility with checkout and other pages
  if (session.userId) {
    setCookie("uid", session.userId, {
      path: "/",
      sameSite: "lax",
    });
  }
}
