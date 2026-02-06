import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";
import { getServerSession } from "@/src/lib/session/getServerSession";

export default function ProfilePage() {
  const session = getServerSession();

//   if (!session) {
//     redirect("/");
//   }

  // ✅ Logged in → render client UI
  return <ProfileClient />;
}
