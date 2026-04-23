"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useState } from "react";

export type ExpressRegisterFormRM = {
  firstName: string;
  lastName: string;
  email: string;
  mobileFullNumber: string;
  mobileNumber: string;
  countryCode: string;
  mobileNumberSortCode: string;
  addLine1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  addressType: 1 | 2 | 3;

  latitude?: number;
  longitude?: number;
};
const addressOptions: { label: string; value: 1 | 2 | 3 }[] = [
  { label: "Home", value: 1 },
  { label: "Office", value: 2 },
  { label: "Other", value: 3 },
];
export default function ExpressRegisterForm({
  form,
  onSubmit,
  cartId,
  isExpressOrder = true,
  isRaffle
}: {
  form: UseFormReturn<ExpressRegisterFormRM>
  onSubmit: (payload: any) => Promise<void>;
  cartId?: string;
  isExpressOrder?: boolean;
  isRaffle: boolean;
}) {
  const t = useTranslations();
  const [mobileFullValue, setMobileFullValue] = useState(
    form.getValues("mobileFullNumber") || ""
  );
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const addressType = watch("addressType");
  const buildPayload = (data: ExpressRegisterFormRM) => {
    const mobile = data.mobileNumber?.replace(/\D/g, "") || "";

    return {
      cartId,
      email: data.email,

      phone: mobile,
      countryCode: `+${data.countryCode}`,

      // ✅ Dynamic ISO (IN, US, PR)
      mobileNumberSortCode: data.mobileNumberSortCode,

      isRaffle,
      discount: 0,
      ...(isExpressOrder && {
        addLine1: data.addLine1,
        addLine2: data.addLine1,
        addressCity: data.city,
        addressState: data.state,
        addressCountry: data.country,
        addressPostCode: data.pincode,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        // addressType: data.addressType,
        default: true,
      }),

      firstName: data.firstName,
      lastName: data.lastName,
    };
  };
  return (
    <form
      id="express-form"
      onSubmit={handleSubmit(async (data: ExpressRegisterFormRM) => {
        const payload = buildPayload(data);
        await onSubmit(payload);
      })}
      className="space-y-5"
    >
      {/* 👤 BASIC INFO */}
      <section className=" p-1 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" error={!!errors.firstName} required>
              {t("firstName")}
            </Label>
            <Input
              id="firstName"
              placeholder={t("firstNamePlaceholder")}
              error={!!errors.firstName}
              {...register("firstName", {
                required: t("firstNameRequired"),
              })}
            />
            <ErrorMessage message={errors.firstName?.message} />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" error={!!errors.lastName} required>
              {t("lastName")}
            </Label>
            <Input
              id="lastName"
              placeholder={t("lastNamePlaceholder")}
              error={!!errors.lastName}
              {...register("lastName", {
                required: t("lastNameRequired"),
              })}
            />
            <ErrorMessage message={errors.lastName?.message} />
          </div>

          {/* Email */}
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="email" error={!!errors.email} required>
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              error={!!errors.email}
              {...register("email", {
                required: t("emailRequired"),
              })}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
            />
            <ErrorMessage message={errors.email?.message} />
          </div>

          {/* Mobile */}
          <div className="sm:col-span-2 space-y-2 custom-phone-no">
            <Label error={!!errors.mobileNumber} required>
              {t("mobile")}
            </Label>
            <PhoneInput
              country="us"
              value={mobileFullValue}
              onChange={(value, country: any) => {
                if (!country?.dialCode) return;

                const dialCode = country.dialCode;
                const isoCode = country.countryCode?.toUpperCase();

                // ✅ update local state (prevents re-render issues)
                setMobileFullValue(value);

                // ✅ sync with react-hook-form
                setValue("mobileFullNumber", value, { shouldDirty: true });

                const numberWithoutCode = value.startsWith(dialCode)
                  ? value.slice(dialCode.length)
                  : value;

                setValue("countryCode", dialCode);
                setValue("mobileNumber", numberWithoutCode);
                setValue("mobileNumberSortCode", isoCode);
              }}
              inputClass={`!w-full !h-[44px] !rounded-lg !border ${errors.mobileNumber ? "!border-red-500" : "!border-input"
                }`}
            />

            <ErrorMessage message={errors.mobileNumber?.message} />
          </div>
        </div>
      </section>

      {/* Address */}
      {!isRaffle && (<section className="p-1 rounded-2xl space-y-4">
        {/* Address Line */}
        <div className="space-y-2">
          <Label required error={!!errors.addLine1}>
            {t("address")}
          </Label>

          <Textarea
            rows={3}
            placeholder={t("addressPlaceholder")}
            error={!!errors.addLine1}
            {...register("addLine1", {
              required: t("addressRequired"),
            })}
          />

          <ErrorMessage message={errors.addLine1?.message} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Country */}
          <div className="space-y-2">
            <Label required error={!!errors.country}>
              {t("country")}
            </Label>
            <Input
              placeholder={t("country")}
              defaultValue="Puerto Rico"
              {...register("country", { required: t("countryRequired") })}
            />
            <ErrorMessage message={errors.country?.message} />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label required error={!!errors.city}>
              {t("city")}
            </Label>
            <Input
              placeholder={t("cityPlaceholder")}
              defaultValue="San Juan"
              {...register("city", { required: t("cityRequired") })}
            />
            <ErrorMessage message={errors.city?.message} />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label required error={!!errors.state}>
              {t("state")}
            </Label>
            <Input
              placeholder={t("statePlaceholder")}
              error={!!errors.state}
              {...register("state", {
                required: t("stateRequired"),
              })}
            />
            <ErrorMessage message={errors.state?.message} />
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Label required error={!!errors.pincode}>
              {t("pincode")}
            </Label>
            <Input
              placeholder={t("pincodePlaceholder")}
              error={!!errors.pincode}
              {...register("pincode", {
                required: t("pincodeRequired"),
              })}
            />
            <ErrorMessage message={errors.pincode?.message} />
          </div>
        </div>
      </section>)}

      {/* Address Type */}
      {!isRaffle && (<section className="p-1 rounded-2xl">
        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
          {t("addressType")}
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {addressOptions.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={addressType === item.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setValue("addressType", item.value)}
            >
              {t(`addressType${item.label}`)}
            </Button>
          ))}
        </div>
      </section>)}


    </form>
  );
}