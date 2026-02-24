"use client";

import Image from "next/image";
import { useProfile } from "@/src/lib/hooks/userProfile";
import { CheckCircle2, XCircle, Mail, Phone, MapPin, Calendar, User, Shield, Wallet, Activity } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { useTranslations } from "next-intl";
import Avatar from "@/src/components/ui/avatar";
import Loader from "@/src/components/loader";

const InfoItem = ({ label, value, icon }: { label: string; value?: any; icon?: React.ReactNode }) => (
  <div className="group relative p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 hover:border-[#D4AF37]/30 hover:shadow-md transition-all duration-200">
    <div className="flex items-start gap-4">
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="text-sm font-bold text-gray-900 break-words">
          {value || <span className="text-gray-400 font-normal">-</span>}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "success" | "default" }) => (
  <span className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm ${variant === "success"
    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300"
    }`}>
    {children}
  </span>
);

export default function ProfileClient() {
  const { user, loading } = useProfile();
  const t = useTranslations();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          {/* <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4AF37] border-t-transparent mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading profile…</p>
          </div> */}
          <Loader />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-600 text-lg">No profile data available</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      <Header />
      <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 py-6 space-y-4 sm:space-y-6">

        {/* ===== Profile Header Card ===== */}
        <div className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>

          <div className="relative flex flex-col md:flex-row gap-4 md:gap-5">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <div>
                <Avatar
                  src={user.profilePic}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size={80}
                  className="shadow-lg w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-white ring-offset-2 ring-offset-gray-50 w-full h-full !overflow-visible"
                />

                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div> */}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium mb-3">
                  @{user.userName}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge variant={user.statusMsg?.toLowerCase() === "approved" ? "success" : "default"}>
                  {user.statusMsg}
                </StatusBadge>
                <StatusBadge variant="default">
                  {user.userTypeText}
                </StatusBadge>
                <StatusBadge variant="default">
                  {user.customerTypeText}
                </StatusBadge>
              </div>

              {/* Bio Quote */}
              {user.statusBio && (
                <div className="relative mt-3 p-3 bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent rounded-lg border-l-3 border-[#D4AF37] shadow-sm">
                  <p className="text-sm sm:text-base text-gray-800 italic font-medium leading-relaxed">
                    "{user.statusBio}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Grid Sections ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

          {/* Contact Information Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span>{t("contactInformation")}</span>
              </h2>
              <div className="space-y-3">
                <InfoItem
                  label={t("email")}
                  value={user.email}
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("emailVerified")}
                  value={
                    <span className={`flex items-center gap-2 font-semibold ${user.emailVerified ? "text-green-600" : "text-red-600"
                      }`}>
                      {user.emailVerified ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          {t("verified")}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          {t("notVerified")}
                        </>
                      )}
                    </span>
                  }
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("mobile")}
                  value={`${user.countryCode} ${user.mobile}`}
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("mobileVerified")}
                  value={
                    <span className={`flex items-center gap-2 font-semibold ${user.mobileVerified ? "text-green-600" : "text-red-600"
                      }`}>
                      {user.mobileVerified ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          {t("verified")}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          {t("notVerified")}
                        </>
                      )}
                    </span>
                  }
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("country")}
                  value={user.country}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("city")}
                  value={user.city || user.region}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span>{t("accountDetails")}</span>
              </h2>
              <div className="space-y-3">
                <InfoItem
                  label={t("gender")}
                  value={user.genderText}
                  icon={<User className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("dateOfBirth")}
                  value={user.dateOfBirth}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("loginType")}
                  value={user.loginTypeText}
                  icon={<Shield className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("kycStatus")}
                  value={
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${user.isKYCStatusText?.toLowerCase() === "approved"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                      }`}>
                      {user.isKYCStatusText}
                    </span>
                  }
                  icon={<Shield className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("registeredOn")}
                  value={new Date(user.createdISOdate).toLocaleDateString()}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("lastLogin")}
                  value={new Date(user.mobileDevices?.lastISOdate).toLocaleString()}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Wallet & Verification Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-md">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span>{t("walletVerification")}</span>
              </h2>
              <div className="space-y-3">
                <InfoItem
                  label={t("walletBalance")}
                  value={
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#B8941F] bg-clip-text text-transparent">
                      ${user.wallet?.balance || "0.00"}
                    </span>
                  }
                  icon={<Wallet className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("hardLimit")}
                  value={user.wallet?.hardLimit}
                  icon={<Wallet className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("softLimit")}
                  value={user.wallet?.softLimit}
                  icon={<Wallet className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("kycApproved")}
                  value={
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${user.isKYCApproved
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                      }`}>
                      {user.isKYCApproved ? t("approved") : t("pending")}
                    </span>
                  }
                  icon={<Shield className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span>{t("activity")}</span>
              </h2>
              <div className="space-y-3">
                <InfoItem
                  label={t("followers")}
                  value={
                    <span className="text-2xl font-extrabold text-gray-900">
                      {user.count?.followerCount || 0}
                    </span>
                  }
                  icon={<Activity className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("following")}
                  value={
                    <span className="text-2xl font-extrabold text-gray-900">
                      {user.count?.followeeCount || 0}
                    </span>
                  }
                  icon={<Activity className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("posts")}
                  value={
                    <span className="text-2xl font-extrabold text-gray-900">
                      {user.count?.postsCount || 0}
                    </span>
                  }
                  icon={<Activity className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("channels")}
                  value={
                    <span className="text-2xl font-extrabold text-gray-900">
                      {user.count?.totalChannel || 0}
                    </span>
                  }
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
