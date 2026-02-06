"use client";

import Image from "next/image";
import LogoutButton from "./LogoutButton";
import { useProfile } from "@/src/lib/hooks/userProfile";

const InfoItem = ({ label, value }: { label: string; value?: any }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">
      {value || "-"}
    </p>
  </div>
);

export default function ProfileClient() {
  const { user, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return <div className="text-center">No profile data</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

      {/* ===== Header ===== */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        <Image
          src={user.profilePic || "/avatar-placeholder.png"}
          alt="Profile"
          width={96}
          height={96}
          className="rounded-full object-cover"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            {user.firstName} {user.lastName}
          </h1>

          <p className="text-sm text-gray-500">
            @{user.userName}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
              {user.statusMsg}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-gray-100">
              {user.userTypeText}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-gray-100">
              {user.customerTypeText}
            </span>
          </div>

          {user.statusBio && (
            <p className="mt-3 text-sm text-gray-700">
              “{user.statusBio}”
            </p>
          )}
        </div>
      </div>

      {/* ===== Grid Sections ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Email" value={user.email} />
            <InfoItem
              label="Email Verified"
              value={user.emailVerified ? "Yes" : "No"}
            />
            <InfoItem
              label="Mobile"
              value={`${user.countryCode} ${user.mobile}`}
            />
            <InfoItem
              label="Mobile Verified"
              value={user.mobileVerified ? "Yes" : "No"}
            />
            <InfoItem label="Country" value={user.country} />
            <InfoItem label="City" value={user.city || user.region} />
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Account Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Gender" value={user.genderText} />
            <InfoItem label="Date of Birth" value={user.dateOfBirth} />
            <InfoItem label="Login Type" value={user.loginTypeText} />
            <InfoItem label="KYC Status" value={user.isKYCStatusText} />
            <InfoItem
              label="Registered On"
              value={new Date(user.createdISOdate).toLocaleDateString()}
            />
            <InfoItem
              label="Last Login"
              value={new Date(user.mobileDevices?.lastISOdate).toLocaleString()}
            />
          </div>
        </div>

        {/* Wallet & KYC */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Wallet & Verification</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Wallet Balance" value={user.wallet?.balance} />
            <InfoItem label="Hard Limit" value={user.wallet?.hardLimit} />
            <InfoItem label="Soft Limit" value={user.wallet?.softLimit} />
            <InfoItem
              label="KYC Approved"
              value={user.isKYCApproved ? "Yes" : "Pending"}
            />
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Followers" value={user.count?.followerCount} />
            <InfoItem label="Following" value={user.count?.followeeCount} />
            <InfoItem label="Posts" value={user.count?.postsCount} />
            <InfoItem label="Channels" value={user.count?.totalChannel} />
          </div>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-wrap gap-4">
        <button className="btn-primary px-4 py-2 rounded-md">
          Edit Profile
        </button>
        <button className="px-4 py-2 rounded-md border">
          View QR Code
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
