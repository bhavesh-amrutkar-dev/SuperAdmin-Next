"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useEffect } from "react";

import ErrorMessage from "@/src/components/ui/errorMessage";
import { AuthService } from "@/src/lib/services/auth";
import Header from "@/src/components/layout/Header";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import Footer from "@/src/components/layout/Footer";
import { CountryCurrency } from "@/src/models/api/response/auth";

type AddressFormRM = {
  firstName: string;
  lastName: string;
  addLine1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobileNumber: string;
  countryCode: string;
  taggedAs: "Home" | "Office" | "Other";
  taggedAsLabel?: string;
};

const DEFAULT_COORDS = {
  latitude: "0.0",
  longitude: "0.0",
};

const inputBase =
  "w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400";

export default function AddressPage() {
  const t = useTranslations();
  const router = useRouter();

  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormRM>({
    defaultValues: { taggedAs: "Home" },
  });

  const taggedAs = watch("taggedAs");

  useEffect(() => {
    let mounted = true;

    const fetchCountries = async () => {
      setCountriesLoading(true);
      setCountriesError(null);

      try {
        const res = await AuthService.getCurrency();
        if (mounted) {
          setCountries(res?.data ?? []);
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

  const onSubmit = async (payload: AddressFormRM) => {
    try {
      await AuthService.createAddress({
        ...payload,
        name: `${payload.firstName} ${payload.lastName}`,
        tagged:
          payload.taggedAs === "Home"
            ? 1
            : payload.taggedAs === "Office"
            ? 2
            : 3,
        taggedAs: payload.taggedAsLabel ?? payload.taggedAs,
        default: true,
        latitude: DEFAULT_COORDS.latitude,
        longitude: DEFAULT_COORDS.longitude,
      });

      router.replace("/");
    } catch (err: any) {
      toast.error(err?.message || t("addressSaveFailed"));
    }
  };

  return (
    <>
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-6 py-6">
            <h1 className="text-2xl font-semibold">{t("completeProfile")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("addressRequired")}</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-10 px-6 py-8"
          >
            {/* Personal Info */}
            <section className="space-y-5">
              <h2 className="text-sm font-semibold uppercase text-gray-600">
                {t("personalInformation")}
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">{t("firstName")}</label>
                  <input
                    className={`${inputBase} ${
                      errors.firstName ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder={t("firstNamePlaceholder")}
                    {...register("firstName", {
                      required: t("firstNameRequired"),
                    })}
                  />
                  <ErrorMessage message={errors.firstName?.message} />
                </div>

                <div>
                  <label className="text-sm font-medium">{t("lastName")}</label>
                  <input
                    className={`${inputBase} ${
                      errors.lastName ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder={t("lastNamePlaceholder")}
                    {...register("lastName", {
                      required: t("lastNameRequired"),
                    })}
                  />
                  <ErrorMessage message={errors.lastName?.message} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">{t("mobile")}</label>
                  <PhoneInput
                    country="us"
                    containerClass="!w-full"
                    inputClass="!w-full !h-[46px] !rounded-xl !border !border-gray-300 !text-sm !pl-14
                      focus:!border-yellow-400 focus:!ring-2 focus:!ring-yellow-100"
                    onChange={(value, country: any) => {
                      setValue("countryCode", `+${country.dialCode}`);
                      setValue(
                        "mobileNumber",
                        value.replace(country.dialCode, "")
                      );
                    }}
                  />
                  <ErrorMessage message={errors.mobileNumber?.message} />
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="space-y-5">
              <h2 className="text-sm font-semibold uppercase text-gray-600">
                {t("paymentInformation")}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("address")}</label>
                  <textarea
                    rows={3}
                    className={`${inputBase} ${
                      errors.addLine1 ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder={t("addressPlaceholder")}
                    {...register("addLine1", {
                      required: t("addressRequired"),
                    })}
                  />
                  <ErrorMessage message={errors.addLine1?.message} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">{t("country")}</label>
                    <select
                      className={`${inputBase} ${
                        errors.country ? "border-red-400" : "border-gray-300"
                      }`}
                      {...register("country", {
                        required: t("countryRequired"),
                      })}
                      disabled={countriesLoading}
                    >
                      <option value="">{t("selectCountry")}</option>
                      {countries.map((c) => (
                        <option key={c._id} value={c.countryCode}>
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </select>
                    <ErrorMessage message={errors.country?.message} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("city")}</label>
                    <input
                      className={`${inputBase} ${
                        errors.city ? "border-red-400" : "border-gray-300"
                      }`}
                      {...register("city", {
                        required: t("cityRequired"),
                      })}
                    />
                    <ErrorMessage message={errors.city?.message} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("state")}</label>
                    <input
                      className={`${inputBase} ${
                        errors.state ? "border-red-400" : "border-gray-300"
                      }`}
                      {...register("state", {
                        required: t("stateRequired"),
                      })}
                    />
                    <ErrorMessage message={errors.state?.message} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("pincode")}</label>
                    <input
                      className={`${inputBase} ${
                        errors.pincode ? "border-red-400" : "border-gray-300"
                      }`}
                      {...register("pincode", {
                        required: t("pincodeRequired"),
                      })}
                    />
                    <ErrorMessage message={errors.pincode?.message} />
                  </div>
                </div>
              </div>
            </section>

            {/* Address Type */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase text-gray-600">
                {t("addressType")}
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {["Home", "Office", "Other"].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setValue("taggedAs", key as AddressFormRM["taggedAs"])
                    }
                    className={`rounded-xl border py-2.5 text-sm font-medium transition
                      ${
                        taggedAs === key
                          ? "border-yellow-400 bg-yellow-100"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {t(`addressType${key}`)}
                  </button>
                ))}
              </div>

              {taggedAs === "Other" && (
                <div>
                  <input
                    className={`${inputBase} ${
                      errors.taggedAsLabel
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder={t("addressTypeOtherPlaceholder")}
                    {...register("taggedAsLabel", {
                      required: t("addressTypeOtherRequired"),
                    })}
                  />
                  <ErrorMessage message={errors.taggedAsLabel?.message} />
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl btn-primary py-3 text-sm font-semibold disabled:opacity-50"
            >
              {isSubmitting ? t("saving") : t("continue")}
            </button>
          </form>
        </div>
      </div>

      <PreFooterIconModule />
      <Footer />
    </>
  );
}
