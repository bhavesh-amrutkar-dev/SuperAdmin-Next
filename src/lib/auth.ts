import { setCookie } from "cookies-next";

export function setupAuthSession(data: any) {
  const token = data?.token?.accessToken;
  const refreshToken = data?.token?.refreshToken;
  const sid = data?.sid || data?.userId;

  if (token) setCookie("token", token, {
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });
  if (refreshToken) setCookie("refresh_token", refreshToken, {
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });
  if (sid) setCookie("sid", sid, {
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });

  localStorage.setItem("user", JSON.stringify(data));
}
