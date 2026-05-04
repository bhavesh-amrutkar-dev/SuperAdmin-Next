"use client";

import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useProfile } from "@/src/lib/hooks/userProfile";
import {
  CheckCircle2, XCircle, Mail, Phone, MapPin,
  Calendar, User, Shield, Wallet, Activity, Loader2,
} from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { useTranslations } from "next-intl";
import Avatar from "@/src/components/ui/avatar";
import Loader from "@/src/components/loader";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { AuthService } from "@/src/lib/services/auth";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { getCookie } from "cookies-next";
import { toast } from "sonner";
import { getErrorMessage } from "@/src/lib/utils/errorMessage";

const OTP_LENGTH = 4;

const InfoItem = ({ label, value, icon }: { label: string; value?: any; icon?: React.ReactNode }) => (
  <div className="group relative p-3 lg:p-4 sm:min-h-[82px] rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 hover:border-[#D4AF37]/30 hover:shadow-md transition-all duration-200 flex items-center">
    <div className="flex items-center gap-4">
      {icon && (
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="text-sm font-semibold text-gray-900 break-words">
          {value || <span className="text-gray-400 font-normal">-</span>}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "success" | "default" }) => (
  <span className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg shadow-sm ${variant === "success"
    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300"
    }`}>
    {children}
  </span>
);

export default function ProfileClient() {
  const { user, loading, refetch } = useProfile();
  const t = useTranslations();

  // ── Modal open/close ──────────────────────────────────────────────────────
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // ── Phone input state ─────────────────────────────────────────────────────
  const [countryCode, setCountryCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [countrySortCode, setCountrySortCode] = useState("us");
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // ── OTP state ─────────────────────────────────────────────────────────────
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpId, setOtpId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Load country list when modal opens
  useEffect(() => {
    if (!showVerifyModal) return;
    setCountriesLoading(true);
    AuthService.getCurrency()
      .then((res) => setCountries(res?.data ?? []))
      .catch(() => { })
      .finally(() => setCountriesLoading(false));
  }, [showVerifyModal]);

  // Reset modal state on close
  const closeModal = () => {
    setShowVerifyModal(false);
    setMobile("");
    setCountryCode("");
    setCountrySortCode("us");
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpId("");
    setOtpSent(false);
    setSendingOtp(false);
    setVerifying(false);
  };

  // ── OTP digit handler ─────────────────────────────────────────────────────
  const handleOtpChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 1) {
      const digits = val.slice(0, OTP_LENGTH).split("");
      const next = [...otp];
      digits.forEach((d, i) => { if (i < next.length) next[i] = d; });
      setOtp(next);
      return;
    }
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < OTP_LENGTH - 1) {
      document.getElementById(`profile-otp-${index + 1}`)?.focus();
    }
  };

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (!cleaned) {
      toast.error(t("fieldRequired"));
      return;
    }
    try {
      setSendingOtp(true);
      const token = getCookie("token") as string;
      console.log("mobileToken", token);

      const setRes = await fetch("/api/setMobileNumber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          phone: cleaned,
          countryCode,
          mobileNumberSortCode: countrySortCode.toUpperCase(),
        }),
      });
      const setData = await setRes.json();
      if (!setRes.ok) throw new Error(setData.message);

      const otpRes = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: cleaned, email: user.email }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.message);

      setOtpId(otpData?.data?.otpId);
      setOtpSent(true);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Something went wrong"));
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) { toast.error(t("guestProfileOtpInvalid")); return; }
    if (!otpId) { toast.error("OTP session expired. Please resend."); return; }
    try {
      setVerifying(true);
      const res = await AuthService.verifyOtp({ otpCode, otpId, verifyType: 2 });
      if (!res?.data) throw new Error(t("guestProfileOtpInvalid"));
      toast.success(t("verified"));
      closeModal();
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Invalid OTP"));
    } finally {
      setVerifying(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
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
      <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 py-6 md:py-8 space-y-4 sm:space-y-6">

        {/* ===== Profile Header Card ===== */}
        <div className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>

          <div className="relative flex flex-col md:flex-row gap-4 md:gap-5">
            <div className="relative flex-shrink-0">
              <Avatar
                src={user.profilePic}
                firstName={user.firstName}
                lastName={user.lastName}
                size={80}
                className="btn-primary pointer-events-none shadow-lg w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-white ring-offset-2 ring-offset-gray-50 w-full h-full !overflow-visible"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium mb-3">
                  @{user.userName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge variant={user.statusMsg?.toLowerCase() === "approved" ? "success" : "default"}>
                  {user.statusMsg}
                </StatusBadge>
                <StatusBadge variant="default">{user.userTypeText}</StatusBadge>
                <StatusBadge variant="default">{user.customerTypeText}</StatusBadge>
              </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Contact Information Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-5 md:mb-6 flex items-center gap-3">
                <div className="w-10 h-10 !rounded-xl btn-primary !border-none flex items-center justify-center shadow-md pointer-events-none">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span>{t("contactInformation")}</span>
              </h2>
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                <InfoItem
                  label={t("email")}
                  value={user.email}
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("emailVerified")}
                  value={
                    <span className={`flex items-center gap-2 font-semibold ${user.emailVerified ? "text-green-600" : "text-red-600"}`}>
                      {user.emailVerified ? (
                        <><CheckCircle2 className="w-5 h-5" />{t("verified")}</>
                      ) : (
                        <><XCircle className="w-5 h-5" />{t("notVerified")}</>
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
                  value={(() => {
                    const isVerified = user.source === "guest"
                      ? Boolean(user.isMobileVerified)
                      : Boolean(user.mobileVerified);
                    return (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`flex items-center gap-2 font-semibold ${isVerified ? "text-green-600" : "text-red-600"}`}>
                          {isVerified ? (
                            <><CheckCircle2 className="w-5 h-5" />{t("verified")}</>
                          ) : (
                            <><XCircle className="w-5 h-5" />{t("notVerified")}</>
                          )}
                        </span>
                        {!isVerified && (
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => setShowVerifyModal(true)}
                          >
                            {t("verifyNow")}
                          </Button>
                        )}
                      </div>
                    );
                  })()}
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
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-5 md:mb-6 flex items-center gap-3">
                <div className="w-10 h-10 !rounded-xl btn-primary pointer-events-none !border-none flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span>{t("accountDetails")}</span>
              </h2>
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                <InfoItem label={t("gender")} value={user.genderText} icon={<User className="w-4 h-4" />} />
                <InfoItem label={t("dateOfBirth")} value={user.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
                <InfoItem label={t("loginType")} value={user.loginTypeText} icon={<Shield className="w-4 h-4" />} />
                <InfoItem
                  label={t("kycStatus")}
                  value={
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${user.isKYCStatusText?.toLowerCase() === "approved"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-400 text-[#2f2f2f]"
                      }`}>
                      {user.isKYCStatusText}
                    </span>
                  }
                  icon={<Shield className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("registeredOn")}
                  value={user.createdISOdate ? new Date(user.createdISOdate as string).toLocaleDateString() : undefined}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("lastLogin")}
                  value={user.mobileDevices?.lastISOdate ? new Date(user.mobileDevices.lastISOdate as string).toLocaleString() : undefined}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Wallet & Verification Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-5 md:mb-6 flex items-center gap-3">
                <div className="w-10 h-10 !rounded-xl btn-primary pointer-events-none !border-none flex items-center justify-center shadow-md">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span>{t("walletVerification")}</span>
              </h2>
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                <InfoItem
                  label={t("walletBalance")}
                  value={
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#B8941F] bg-clip-text text-transparent">
                      ${user.wallet?.balance || "0.00"}
                    </span>
                  }
                  icon={<Wallet className="w-4 h-4" />}
                />
                <InfoItem label={t("hardLimit")} value={user.wallet?.hardLimit} icon={<Wallet className="w-4 h-4" />} />
                <InfoItem label={t("softLimit")} value={user.wallet?.softLimit} icon={<Wallet className="w-4 h-4" />} />
                <InfoItem
                  label={t("kycApproved")}
                  value={
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${user.isKYCApproved
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-400 text-[#2f2f2f]"
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
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-5 md:mb-6 flex items-center gap-3">
                <div className="w-10 h-10 !rounded-xl btn-primary pointer-events-none !border-none flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span>{t("activity")}</span>
              </h2>
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                <InfoItem
                  label={t("followers")}
                  value={<span className="text-2xl font-extrabold text-gray-900">{user.count?.followerCount || 0}</span>}
                  icon={<Activity className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("following")}
                  value={<span className="text-2xl font-extrabold text-gray-900">{user.count?.followeeCount || 0}</span>}
                  icon={<Activity className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("posts")}
                  value={<span className="text-2xl font-extrabold text-gray-900">{user.count?.postsCount || 0}</span>}
                  icon={<Activity className="w-4 h-4" />}
                />
                <InfoItem
                  label={t("channels")}
                  value={<span className="text-2xl font-extrabold text-gray-900">{user.count?.totalChannel || 0}</span>}
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* ===== Mobile Verification Modal ===== */}
      <Dialog open={showVerifyModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent showCloseButton={true} className="max-w-sm w-[95%]">
          <DialogTitle className="text-xl font-bold text-gray-900 mb-5">
            {t("addYourMobileNumber")}
          </DialogTitle>

          {!otpSent ? (
            /* ── Step 1: Phone input ── */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("guestProfileMobileNumber")}
                </label>
                {countriesLoading || countries.length === 0 ? (
                  <div className="w-full h-[44px] rounded-lg border border-gray-300 px-4 flex items-center text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
                  </div>
                ) : (
                  <PhoneInput
                    country="us"
                    value={`${countryCode.replace("+", "")}${mobile}`}
                    onlyCountries={countries.map((c) => c.countryCode.toLowerCase())}
                    onChange={(value, data: any) => {
                      setCountryCode(`+${data.dialCode}`);
                      setMobile(value.slice(data.dialCode.length));
                      setCountrySortCode(data.countryCode);
                    }}
                    inputClass="!w-full !h-[44px]"
                  />
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={sendingOtp || !mobile}
              >
                {sendingOtp ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("guestProfileOtpSending")}</>
                ) : (
                  t("guestProfileOtpSend")
                )}
              </Button>
            </div>
          ) : (
            /* ── Step 2: OTP input ── */
            <div className="space-y-5">
              <p className="text-sm text-gray-500 text-center">
                {t("guestProfileOtpSentTo")} {countryCode} {mobile}
              </p>

              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`profile-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        document.getElementById(`profile-otp-${i - 1}`)?.focus();
                      }
                    }}
                    className="h-12 w-12 rounded-xl border border-gray-300 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp(Array(OTP_LENGTH).fill(""));
                    setOtpId("");
                  }}
                >
                  {t("back")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerifyOtp}
                  disabled={verifying || otp.some((d) => !d)}
                >
                  {verifying ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
                  ) : (
                    t("guestProfileOtpVerify")
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
