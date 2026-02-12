"use client";

import { useDebounce } from "@/src/lib/hooks/useDebounce";
import { AuthService } from "@/src/lib/services/auth";
import { CountryCurrency } from "@/src/models/api/response/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { CountryData } from "react-phone-input-2";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import ErrorMessage from "@/src/components/ui/errorMessage";
type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  mobile: string;
  countryCode: string;
  country: string;
  password: string;
};

type Errors = Partial<Record<keyof RegisterForm, string>>;

export default function RegisterPage() {
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const t = useTranslations();
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    mobile: "",
    countryCode: "",
    country: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [emailValidating, setEmailValidating] = useState(false);
  const [phoneValidating, setPhoneValidating] = useState(false);
  const debouncedEmail = useDebounce(form.email, 600);
  const debouncedMobile = useDebounce(form.mobile, 600);
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpId, setOtpId] = useState<string | null>(null);

  const router = useRouter();

  const sendOtp = async () => {
    setOtpLoading(true);

    try {
      const res = await AuthService.sendOtp({
        verifyType: 2,
        countryCode: form.countryCode,
        mobile: form.mobile,
        email: form.email,
        triggeredBy: "Customer Signup Verification Code",
      });

      const { otpId, otpExpiryTime } = res.data;

      sessionStorage.setItem(
        "signup_payload",
        JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dob,
          gender: 1,
          mobile: form.mobile,
          countryCode: form.countryCode,
          sortCountryCode: form.country.toLowerCase(),
          nationality: form.country,
          termsAndCond: 1,
          userType: 1,
          signUpType: 1,
          customerType: 1,
        })
      );

      router.push(
        `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
          `${form.countryCode}${form.mobile}`
        )}&otpId=${otpId}&expiry=${otpExpiryTime}&flow=signup`
      );
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || t("otpSendFailed"));
    } finally {
      setOtpLoading(false);
    }
  };
  // const verifyOtp = async () => {
  //   setOtpLoading(true);
  //   setOtpError(null);

  //   try {
  //     await AuthService.verifyOtp({
  //       verifyType: 2,
  //       otpCode: otp,     
  //       otpId: otpId!,
  //     });
  //     setOtpVerified(true);
  //     await completeSignup();
  //   } catch (err: any) {
  //     setOtpError(
  //       err?.response?.data?.message || "Invalid OTP"
  //     );
  //   } finally {
  //     setOtpLoading(false);
  //   }
  // };

  // const completeSignup = async () => {
  //   await AuthService.signUp({
  //     email: form.email,
  //     password: form.password,
  //     firstName: form.firstName,
  //     lastName: form.lastName,
  //     dateOfBirth: form.dob,
  //     gender: 1,
  //     mobile: form.mobile,
  //     countryCode: form.countryCode,
  //     sortCountryCode: form.country.toLowerCase(),
  //     nationality: form.country,
  //     termsAndCond: 1,
  //     userType: 1,
  //     signUpType: 1,
  //     customerType: 1,
  //   });
  // };



  useEffect(() => {
    if (!debouncedEmail || errors.email) return;

    const validateEmail = async () => {
      setEmailValidating(true);
      try {
        await AuthService.emailPhoneValidate({
          verifyType: 1,
          email: debouncedEmail,
        });
        setErrors((prev) => ({ ...prev, email: undefined }));
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          email: err?.response?.data?.message || "Email already exists",
        }));
      } finally {
        setEmailValidating(false);
      }
    };

    validateEmail();
  }, [debouncedEmail]);
  useEffect(() => {
    if (
      !debouncedMobile ||
      !form.countryCode ||
      !form.email ||
      errors.mobile
    )
      return;

    const validatePhone = async () => {
      setPhoneValidating(true);
      try {
        await AuthService.emailPhoneValidate({
          verifyType: 2,
          countryCode: form.countryCode,
          mobile: debouncedMobile,
          email: form.email,
        });

        setErrors((prev) => ({ ...prev, mobile: undefined }));
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          mobile:
            err?.response?.data?.message || "Mobile number already exists",
        }));
      } finally {
        setPhoneValidating(false);
      }
    };

    validatePhone();
  }, [debouncedMobile, form.countryCode, form.email]);



  useEffect(() => {
    let mounted = true;

    const fetchCountries = async () => {
      setCountriesLoading(true);
      setCountriesError(null);

      try {
        const res = await AuthService.getCurrency();

        const list: CountryCurrency[] =
          res?.data ?? [];

        if (mounted) {
          setCountries(list);
        }
      } catch (err) {
        console.error("Currency fetch failed", err);
        if (mounted) {
          setCountriesError("Failed to load countries");
        }
      } finally {
        if (mounted) {
          setCountriesLoading(false);
        }
      }
    };

    fetchCountries();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!form.firstName.trim())
      newErrors.firstName = t("firstNameRequired");

    if (!form.lastName.trim())
      newErrors.lastName = t("lastNameRequired");

    if (!form.email) {
      newErrors.email = t("emailRequired");
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!form.dob) {
      newErrors.dob = t("dobRequired");
    } else {
      const age =
        new Date().getFullYear() - new Date(form.dob).getFullYear();
      if (age < 18) newErrors.dob = t("ageRestriction");
    }

    if (!form.mobile)
      newErrors.mobile = t("mobileRequired");

    if (!form.country)
      newErrors.country = t("countryRequired");

    if (!form.password) {
      newErrors.password = t("passwordRequired");
    } else if (form.password.length < 8) {
      newErrors.password = t("passwordMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await sendOtp();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error?: string) =>
    `
  w-full rounded-lg border bg-white px-4 py-3 text-sm
  placeholder:text-gray-400
  focus:!border-[#f3c200] focus:!ring-2 focus:!ring-yellow-200
  transition-all duration-200
  ${error
      ? "border-red-500 focus:ring-red-200"
      : "border-gray-300 hover:border-gray-400 focus:border-[#f3c200]"
    }
  `;


  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold section_title mb-1">
          {t("createAccount")}
        </h1>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* First Name */}
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            error={!!errors.firstName}
            required
          >
            {t("firstName")}
          </Label>
          <Input
            id="firstName"
            placeholder={t("firstNamePlaceholder")}
            value={form.firstName}
            error={!!errors.firstName}
            onChange={(e) => {
              setForm({ ...form, firstName: e.target.value });
              setErrors({ ...errors, firstName: undefined });
            }}
          />
          <ErrorMessage message={errors.firstName} />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            error={!!errors.lastName}
            required
          >
            {t("lastName")}
          </Label>
          <Input
            id="lastName"
            placeholder={t("lastNamePlaceholder")}
            value={form.lastName}
            error={!!errors.lastName}
            onChange={(e) => {
              setForm({ ...form, lastName: e.target.value });
              setErrors({ ...errors, lastName: undefined });
            }}
          />
          <ErrorMessage message={errors.lastName} />

        </div>

        {/* Email */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="email"
            error={!!errors.email}
            required
          >
            {t("email")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            error={!!errors.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setErrors({ ...errors, email: undefined });
            }}
          />
          {emailValidating && (
            <p className="text-xs text-muted-foreground">
              {t("checkingEmail")}
            </p>
          )}
          <ErrorMessage message={errors.email} />
        </div>

        {/* Password */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="password"
            error={!!errors.password}
            required
          >
            {t("password")}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={form.password}
            error={!!errors.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setErrors({ ...errors, password: undefined });
            }}
          />
          <ErrorMessage message={errors.password} />
        </div>

        {/* Mobile */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="mobile"
            error={!!errors.mobile}
            required
          >
            {t("mobile")}
          </Label>
          <PhoneInput
            inputProps={{ id: "mobile" }}
            country="us"
            value={`${form.countryCode}${form.mobile}`}
            onChange={(value, country) => {
              if (!("dialCode" in country)) return;

              const dialCode = `+${country.dialCode}`;
              const mobile = value.replace(country.dialCode, "");

              setForm((prev) => ({
                ...prev,
                countryCode: dialCode,
                mobile,
              }));
              setErrors((prev) => ({ ...prev, mobile: undefined }));
            }}
            inputClass={`
        !w-full !h-[44px] !rounded-lg
        !border ${errors.mobile ? "!border-red-500" : "!border-input"}
        !pl-14 !text-sm
        focus:!border-ring
        focus:!ring-2 focus:!ring-ring
      `}
          />
          {/* {errors.mobile && (
            <p className="text-xs text-red-500">{errors.mobile}</p>
          )} */}
          <ErrorMessage message={errors.mobile} />
        </div>

        {/* DOB */}
        <div className="space-y-2">
          <Label
            htmlFor="dob"
            error={!!errors.dob}
            required
          >
            {t("dateOfBirth")}
          </Label>
          <Input
            id="dob"
            type="date"
            value={form.dob}
            error={!!errors.dob}
            onChange={(e) => {
              setForm({ ...form, dob: e.target.value });
              setErrors({ ...errors, dob: undefined });
            }}
          />
          <ErrorMessage message={errors.dob} />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label
            htmlFor="country"
            error={!!errors.country}
            required
          >
            {t("country")}
          </Label>
          <select
            id="country"
            className={`
        w-full h-[44px] rounded-lg border bg-background
        px-4 text-sm
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
        ${errors.country
                ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                : "border-input hover:border-muted-foreground/40"
              }
      `}
            value={form.country}
            onChange={(e) => {
              setForm({ ...form, country: e.target.value });
              setErrors({ ...errors, country: undefined });
            }}
          >
            <option value="">{t("selectCountry")}</option>
            {countries.map((c) => (
              <option key={c._id} value={c.countryCode}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          {/* {errors.country && (
            <p className="text-xs text-red-500">{errors.country}</p>
          )} */}
          <ErrorMessage message={errors.country} />
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="md:col-span-2 w-full rounded-lg bg-[#f3c200] py-3 text-sm font-semibold text-black hover:bg-yellow-400 transition"
        >
          {loading ? t("sendingOtp") : t("signUp")}
        </button>

      </form>




      <div className="mt-8 text-center">
        <p className="text-sm">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/auth/login" className="font-semibold hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
