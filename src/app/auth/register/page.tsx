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

    const cleanedForm = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      mobile: form.mobile.trim(),
    };

    try {
      // Call your server-side API route
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: cleanedForm.countryCode,
          mobile: cleanedForm.mobile,
          email: cleanedForm.email,
          
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "OTP send failed");
      }

      const data = await res.json();
      const { otpId, otpExpiryTime } = data?.data;
      sessionStorage.setItem(
        "signup_payload",
        JSON.stringify({
          email: cleanedForm.email,
          password: cleanedForm.password,
          firstName: cleanedForm.firstName,
          lastName: cleanedForm.lastName,
          dateOfBirth: cleanedForm.dob,
          gender: 1,
          mobile: cleanedForm.mobile,
          countryCode: cleanedForm.countryCode,
          sortCountryCode: cleanedForm.country.toLowerCase(),
          nationality: cleanedForm.country,
          termsAndCond: 1,
          userType: 1,
          signUpType: 1,
          customerType: 1,
        })
      );

      router.push(
        `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
          `${cleanedForm.countryCode}${cleanedForm.mobile}`
        )}&otpId=${otpId}&expiry=${otpExpiryTime}&flow=signup`
      );
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };


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
        console.warn("Currency fetch failed", err);
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

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const mobile = form.mobile.trim();

    if (!firstName)
      newErrors.firstName = t("firstNameRequired");

    if (!lastName)
      newErrors.lastName = t("lastNameRequired");

    if (!email) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!form.dob) {
      newErrors.dob = t("dobRequired");
    } else {
      const age =
        new Date().getFullYear() - new Date(form.dob).getFullYear();
      if (age < 18) newErrors.dob = t("ageRestriction");
    }

    if (!mobile)
      newErrors.mobile = t("mobileRequired");

    if (!form.country)
      newErrors.country = t("countryRequired");

    if (!password) {
      newErrors.password = t("passwordRequired");
    } else if (password.length < 8) {
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


  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-6 sm:p-8">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl font-bold section_title mb-1">
          {t("createAccount")}
        </h1>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
              setForm({ ...form, firstName: e.target.value.replace(/^\s+/, "") });
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
              setForm({ ...form, lastName: e.target.value.replace(/^\s+/, "") });
              setErrors({ ...errors, lastName: undefined });
            }}
          />
          <ErrorMessage message={errors.lastName} />

        </div>

        {/* Email */}
        <div className="sm:col-span-2 space-y-2">
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
              setForm({ ...form, email: e.target.value.trim() });
              setErrors({ ...errors, email: undefined });
            }}
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
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
        <div className="sm:col-span-2 space-y-2">
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
            // onKeyDown={(e) => {
            //   if (e.key === " ") e.preventDefault();
            // }}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value.replace(/^\s+/, "") });
              setErrors({ ...errors, password: undefined });
            }}
          />
          <ErrorMessage message={errors.password} />
        </div>

        {/* Mobile */}
        <div className="sm:col-span-2 space-y-2">
          <Label
            htmlFor="mobile"
            error={!!errors.mobile}
            required
          >
            {t("mobile")}
          </Label>
          <div className="phone-input">
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
        !bg-transparent !w-full !h-[44px] !text-sm !rounded-lg !border-[#2f2f2f] focus:!border-[#f3c200]
        !border ${errors.mobile ? "!border-red-500" : "!border-input"}
        !pl-14 !text-sm
        
      `}
            />
          </div>
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
        w-full h-[44px] rounded-lg border
        px-3 text-sm
        transition-all duration-200
        focus:outline-none focus:ring-0 focus:border-ring focus:!border-[#f3c200]
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
          className="sm:col-span-2 w-full rounded-lg btn-primary py-3 font-semibold
      hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 mt-3"
        >
          {loading ? t("sendingOtp") : t("signUp")}
        </button>

      </form>




      <div className="mt-5 sm:mt-6 text-center">
        <p className="text-sm">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/auth/login" className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
