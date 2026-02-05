import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";
import { getServerSession } from "@/src/lib/session/getServerSession";

export default function ProfilePage() {
  const session = getServerSession();
console.log(session);

//   if (!session) {
//     redirect("/");
//   }

  // ✅ Logged in → render client UI
  return <ProfileClient />;
}
