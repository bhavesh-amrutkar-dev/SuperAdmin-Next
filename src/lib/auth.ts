import { setCookie } from "cookies-next";

export function setupAuthSession(data: any) {
  const token = data?.token?.accessToken;
  const refreshToken = data?.token?.refreshToken;
  const sid = data?.sid || data?.userId;

  if (token) setCookie("token", token, { path: "/" });
  if (refreshToken) setCookie("refresh_token", refreshToken, { path: "/" });
  if (sid) setCookie("sid", sid, { path: "/" });

  localStorage.setItem("user", JSON.stringify(data));
}
