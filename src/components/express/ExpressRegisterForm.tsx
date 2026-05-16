"use client";

import { Controller, UseFormReturn, useFormState } from "react-hook-form";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { AuthService } from "@/src/lib/services/auth";
import { getCookie } from "cookies-next";

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
const validators = {
  noOnlySpaces: (value: string, msg: string) => {
    if (!value || value.trim().length === 0) return msg;
    return true;
  },

  name: (value: string, msg: string, nameFormatError: string, nameCharLimitError: string) => {
    if (!value || value.trim().length === 0) return msg;
    if (value.trim().length < 2 || value.trim().length > 50) {
      return nameFormatError;
    }
    return true;
  },

  email: (value: string, msg: string, emailInvalid: string) => {
    if (!value || value.trim().length === 0) return msg;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return emailInvalid;
    }
    return true;
  },

  pincode: (value: string, msg: string, pincodeInvalid: string) => {
    if (!value || value.trim().length === 0) return msg;
    if (!/^[0-9]{4,10}$/.test(value)) {
      return pincodeInvalid;
    }
    return true;
  },
};
export default function ExpressRegisterForm({
  form,
  onSubmit,
  cartId,
  isExpressOrder = true,
  isRaffle,
}: {
  form: UseFormReturn<ExpressRegisterFormRM>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  cartId?: string;
  isExpressOrder?: boolean;
  isRaffle: boolean;
}) {
  const defaultCountry = (getCookie("C_code") as string || "pr").toLowerCase();
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const t = useTranslations();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    // formState: { errors },
  } = form;
  useEffect(() => {
    const fetchCountries = async () => {

      setCountriesLoading(true);
      try {
        const res = await AuthService.getCurrency();
        const list = res?.data ?? [];
        setCountries(list);

      } catch {
        console.log("Failed to load countries");
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);
  const { errors } = useFormState({ control });
  const addressType = watch("addressType");
  const safeTrim = (value?: string) => value?.trim() || "";
  const buildPayload = (data: ExpressRegisterFormRM) => {
    const mobile = data.mobileNumber?.replace(/\D/g, "") || "";

    return {
      cartId,
      email: data.email,
      phone: mobile,
      countryCode: `+${data.countryCode}`,
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
        default: true,
      }),
      firstName: data.firstName,
      lastName: data.lastName,
    };
  };

  return (
    <form
      id="express-form"
      noValidate
      onSubmit={handleSubmit(async (data) => {
        const cleaned = {
          ...data,
          firstName: safeTrim(data.firstName),
          lastName: safeTrim(data.lastName),
          email: safeTrim(data.email),
          addLine1: safeTrim(data.addLine1),
          city: safeTrim(data.city),
          state: safeTrim(data.state),
          country: safeTrim(data.country),
          pincode: safeTrim(data.pincode),
        };

        const payload = buildPayload(cleaned);
        await onSubmit(payload);
      })}
    >
      <section className=" p-1 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" error={!!errors.firstName} required>
              {t("firstName")}
            </Label>
            <Input
              id="firstName"
              maxLength={50}
              placeholder={t("firstNamePlaceholder")}
              error={!!errors.firstName}
              {...register("firstName", {
                required: t("firstNameRequired"),
                validate: (v) => validators.name(v, t("firstNameRequired"), t("nameFormatError"), t("nameCharLimitError")),
              })}
            />
            <ErrorMessage message={errors.firstName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" error={!!errors.lastName} required>
              {t("lastName")}
            </Label>
            <Input
              id="lastName"
              maxLength={50}
              placeholder={t("lastNamePlaceholder")}
              error={!!errors.lastName}
              {...register("lastName", {
                required: t("lastNameRequired"),
                validate: (v) => validators.name(v, t("lastNameRequired"), t("nameFormatError"), t("nameCharLimitError")),
              })}
            />
            <ErrorMessage message={errors.lastName?.message} />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="email" error={!!errors.email} required>
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              error={!!errors.email}
              {...register("email", {
                required: t("emailRequired"),
                validate: (v) => validators.email(v, t("emailRequired"), t("emailInvalid")),
              })}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
            />
            <ErrorMessage message={errors.email?.message} />
          </div>

          <div className="sm:col-span-2 space-y-2 custom-phone-no">
            <Label error={!!errors.mobileFullNumber} required>
              {t("mobile")}
            </Label>
            <Controller
              control={control}
              name="mobileFullNumber"
              defaultValue=""
              rules={{
                required: t("mobileRequired"),
                validate: (value) => {
                  const clean = (value || "").replace(/\D/g, "");
                  if (clean.length < 10) return t("invalidMobile");
                  return true;
                },
              }}
              render={({ field }) =>
                countriesLoading || countries.length === 0 ? (
                  <div className="w-full h-[44px] rounded-lg border border-[#2f2f2f] px-4 flex items-center text-sm text-gray-400">
                    {t("loading")}
                  </div>
                ) : (
                  <div
                    className={`flex items-center rounded-lg border hover:border-[#f3c200] focus-within:border-[#f3c200] transition-colors duration-200 ${errors.mobileFullNumber ? "border-red-500" : "border-[#2f2f2f]"}`}
                    style={{ height: "44px", overflow: "visible", width: "100%" }}
                  >
                    <div className="shrink-0 flex items-center pl-2">
                      <PhoneInput
                        key={defaultCountry}
                        country={defaultCountry}
                        onlyCountries={countries.map((c) => c.countryCode.toLowerCase())}
                        containerStyle={{ height: "44px", width: "40px", flexShrink: 0 }}
                        containerClass="!h-full"
                        countryCodeEditable={false}
                        disableCountryCode={false}
                        inputStyle={{ display: "none" }}
                        buttonStyle={{
                          height: "44px",
                          width: "40px",
                          border: "none",
                          backgroundColor: "transparent",
                          position: "static",
                        }}
                        buttonClass="!border-0 !bg-transparent !shadow-none !static"
                        dropdownStyle={{ zIndex: 9999 }}
                        onMount={(_value, data: any) => {
                          const dialCode = data.dialCode || "";
                          const isoCode = data.countryCode || "";
                          setValue("countryCode", dialCode, { shouldValidate: false });
                          setValue("mobileNumberSortCode", isoCode.toUpperCase(), { shouldValidate: false });
                        }}
                        onChange={(_value, data: any) => {
                          const dialCode = data.dialCode || "";
                          const isoCode = data.countryCode || "";
                          setValue("countryCode", dialCode, { shouldValidate: false });
                          setValue("mobileNumberSortCode", isoCode.toUpperCase(), { shouldValidate: false });
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 shrink-0 mx-1">
                      {watch("countryCode") ? `+${watch("countryCode")}` : "+1"}
                    </span>
                    <input
                      style={{ height: "44px" }}
                      placeholder="Phone Number"
                      className="flex-1 min-w-0 border-0 shadow-none outline-none ring-0 text-sm px-3 bg-transparent focus:outline-none focus:ring-0"
                      maxLength={10}
                      value={watch("mobileNumber") || ""}
                      onChange={(e) => {
                        const num = e.target.value.replace(/\D/g, "");
                        const dialCode = watch("countryCode") || "";
                        setValue("mobileNumber", num, { shouldValidate: false });
                        field.onChange(`${dialCode}${num}`);
                      }}
                      onBlur={() => {
                        const num = watch("mobileNumber") || "";
                        if (num && num.length < 10) {
                          field.onChange(num);
                          form.trigger("mobileFullNumber");
                        }
                      }}
                    />
                  </div>
                )
              }
            />

            <ErrorMessage message={errors.mobileFullNumber?.message} />
          </div>
        </div>
      </section>

      {!isRaffle && (
        <section className="p-1 rounded-2xl space-y-4">
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
                validate: (v) => validators.noOnlySpaces(v, t("addressRequired")),
              })}
            />

            <ErrorMessage message={errors.addLine1?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required error={!!errors.country}>
                {t("country")}
              </Label>
              <Input
                placeholder={t("country")}
                defaultValue="Puerto Rico"
                {...register("country", {
                  required: t("countryRequired"),
                })}
              />
              <ErrorMessage message={errors.country?.message} />
            </div>

            <div className="space-y-2">
              <Label required error={!!errors.city}>
                {t("city")}
              </Label>
              <Input
                placeholder={t("cityPlaceholder")}
                defaultValue="San Juan"
                {...register("city", {
                  required: t("cityRequired"),
                  validate: (v) => validators.noOnlySpaces(v, t("cityRequired")),
                })}
              />
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="space-y-2">
              <Label required error={!!errors.state}>
                {t("state")}
              </Label>
              <Input
                placeholder={t("statePlaceholder")}
                error={!!errors.state}
                {...register("state", {
                  required: t("stateRequired"),
                  validate: (v) => validators.noOnlySpaces(v, t("stateRequired")),
                })}
              />
              <ErrorMessage message={errors.state?.message} />
            </div>

            <div className="space-y-2">
              <Label required error={!!errors.pincode}>
                {t("pincode")}
              </Label>

              <Input
                placeholder={t("pincodePlaceholder")}
                error={!!errors.pincode}
                maxLength={15} // ✅ UI limit
                {...register("pincode", {
                  required: t("pincodeRequired"),
                  maxLength: {
                    value: 15,
                    message: t("pincodeMaxLength") || "Pincode must be at most 15 characters",
                  },
                  validate: (v) =>
                    validators.pincode(
                      v,
                      t("pincodeRequired"),
                      t("pincodeInvalid")
                    ),
                })}
              />

              <ErrorMessage message={errors.pincode?.message} />
            </div>
          </div>
        </section>
      )}

      {!isRaffle && (
        <section className="p-1 rounded-2xl">
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
        </section>
      )}
    </form>
  );
}
