"use client";

import Image from "next/image";
import LogoutButton from "./LogoutButton";
import { useProfile } from "@/src/lib/hooks/userProfile";

export default function ProfileClient() {
  const { user, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return <div className="text-center">No profile data</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white shadow rounded-lg p-6 flex gap-6">

        {/* Profile Image */}
        <div className="shrink-0">
          <Image
            src={user.profilePic || "/avatar-placeholder.png"}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">{user.email}</p>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Mobile</span>
              <p>{user.mobile || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">Country</span>
              <p>{user.country || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">City</span>
              <p>{user.city || "-"}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button className="btn-primary px-4 py-2 rounded-md">
              Edit Profile
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
