"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useEffect } from "react";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { AuthService } from "@/src/lib/services/auth";

export type AddressFormRM = {
  firstName: string;
  lastName: string;
  addLine1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobileNumber: string;
  taggedAs: "Home" | "Office" | "Other";
  taggedAsLabel?: string;
  mobileNumberCode: string;
  mobileNumberSortCode: string;
  landmark: string;
};

const inputBase =
  "w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400";

export default function AddressForm({
  onSubmit,
  defaultValues,
  loading,
}: {
  onSubmit: (data: AddressFormRM) => Promise<void>;
  defaultValues?: Partial<AddressFormRM>;
  loading?: boolean;
}) {
  const t = useTranslations();

  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormRM>({
    defaultValues: {
      taggedAs: "Home",
      ...defaultValues,
    },
  });

  const taggedAs = watch("taggedAs");

  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const res = await AuthService.getCurrency();
        setCountries(res?.data ?? []);
      } finally {
        setCountriesLoading(false);
      }
    };
    fetchCountries();
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Personal Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t("firstName")}</label>
          <input
            className={`${inputBase} ${errors.firstName ? "border-red-400" : "border-gray-300"}`}
            {...register("firstName", { required: t("firstNameRequired") })}
          />
          <ErrorMessage message={errors.firstName?.message} />
        </div>

        <div>
          <label className="text-sm font-medium">{t("lastName")}</label>
          <input
            className={`${inputBase} ${errors.lastName ? "border-red-400" : "border-gray-300"}`}
            {...register("lastName", { required: t("lastNameRequired") })}
          />
          <ErrorMessage message={errors.lastName?.message} />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">{t("mobile")}</label>
          <PhoneInput
            country="us"
            containerClass="!w-full"
            inputClass="!w-full !h-[46px] !rounded-xl !border !border-gray-300 !text-sm !pl-14"
            onChange={(value, country: any) => {
              setValue("mobileNumber", value.replace(country.dialCode, ""));
              setValue("mobileNumberCode", country.dialCode);
              setValue("mobileNumberSortCode", country.countryCode);
            }}
          />
          <ErrorMessage message={errors.mobileNumber?.message} />
        </div>
      </div>

      {/* Address Fields */}
      <div className="space-y-4">
        <textarea
          rows={3}
          className={`${inputBase} ${errors.addLine1 ? "border-red-400" : "border-gray-300"}`}
          {...register("addLine1", { required: t("addressRequired") })}
        />
        <ErrorMessage message={errors.addLine1?.message} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            className={`${inputBase} ${errors.country ? "border-red-400" : "border-gray-300"}`}
            {...register("country", { required: t("countryRequired") })}
            disabled={countriesLoading}
          >
            <option value="">{t("selectCountry")}</option>
            {countries.map((c) => (
              <option key={c._id} value={c.name}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          <ErrorMessage message={errors.country?.message} />

          <input
            className={`${inputBase} ${errors.city ? "border-red-400" : "border-gray-300"}`}
            {...register("city", { required: t("cityRequired") })}
          />
          <ErrorMessage message={errors.city?.message} />

          <input
            className={`${inputBase} ${errors.state ? "border-red-400" : "border-gray-300"}`}
            {...register("state", { required: t("stateRequired") })}
          />
          <ErrorMessage message={errors.state?.message} />

          <input
            className={`${inputBase} ${errors.pincode ? "border-red-400" : "border-gray-300"}`}
            {...register("pincode", { required: t("pincodeRequired") })}
          />
          <ErrorMessage message={errors.pincode?.message} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full rounded-xl btn-primary py-3 text-sm font-semibold disabled:opacity-50"
      >
        {isSubmitting ? t("saving") : t("continue")}
      </button>
    </form>
  );
}
