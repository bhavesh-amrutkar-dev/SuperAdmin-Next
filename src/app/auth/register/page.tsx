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

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="text-sm font-medium">{t("firstName")}</label>
            <input placeholder={t("firstNamePlaceholder")}
              className={inputClass(errors.firstName)}
              value={form.firstName}
              onChange={(e) => {
                setForm({ ...form, firstName: e.target.value });
                setErrors({ ...errors, firstName: undefined });
              }}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium">{t("lastName")}</label>
            <input placeholder={t("lastNamePlaceholder")}
              className={inputClass(errors.lastName)}
              value={form.lastName}
              onChange={(e) => {
                setForm({ ...form, lastName: e.target.value });
                setErrors({ ...errors, lastName: undefined });
              }}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>


        {/* Email */}
        <div>
          <label className="text-sm font-medium">{t("email")}</label>
          <input
            placeholder="you@example.com"
            className={inputClass(errors.email)}
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setErrors({ ...errors, email: undefined });
            }}
          />
          {emailValidating && (
            <p className="text-xs text-gray-400 mt-1">
              {t("checkingEmail")}
            </p>
          )}
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* DOB */}
        <div>
          <label className="text-sm font-medium">{t("dateOfBirth")}</label>
          <input
            type="date"
            className={inputClass(errors.dob)}
            value={form.dob}
            onChange={(e) => {
              setForm({ ...form, dob: e.target.value });
              setErrors({ ...errors, dob: undefined });
            }}
          />
          {errors.dob && (
            <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label className="text-sm font-medium">{t("mobile")}</label>
          <PhoneInput
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
      !w-full !h-[44px] !rounded-lg !border !border-gray-300
      !pl-14 !text-sm focus:!border-[#f3c200]
      ${errors.mobile ? "!border-red-500" : ""}
    `}
          />
          {errors.mobile && (
            <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="text-sm font-medium">{t("country")}</label>
          <select
            className={inputClass(errors.country)}
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
          {errors.country && (
            <p className="text-xs text-red-500 mt-1">{errors.country}</p>
          )}
        </div>



        <div className="md:col-span-2">
          <label className="text-sm font-medium">{t("password")}</label>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            className={inputClass(errors.password)}
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setErrors({ ...errors, password: undefined });
            }}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <button
          disabled={loading}
          className="
    md:col-span-2 w-full rounded-lg bg-[#f3c200]
    py-3 text-sm font-semibold text-black
    hover:bg-yellow-400 transition
  "
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
