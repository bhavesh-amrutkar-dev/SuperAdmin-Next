import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { token } = await req.json();

  const cookieStore = await cookies();

  // cookieStore.set("token", token, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "lax",
  //   path: "/",
  // });

  return NextResponse.json({ success: true });
}