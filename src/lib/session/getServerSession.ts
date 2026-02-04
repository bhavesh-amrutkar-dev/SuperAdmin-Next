// lib/auth/getServerSession.ts
import { cookies } from "next/headers";

export interface ServerSession {
  token: string;
//   isGuest: boolean;
}

export async function getServerSession(): Promise< ServerSession | null> {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("access_token")?.value;
//   const isGuest = cookieStore.get("is_guest")?.value === "1";

  if (!token) return null;

  return { token };
}
