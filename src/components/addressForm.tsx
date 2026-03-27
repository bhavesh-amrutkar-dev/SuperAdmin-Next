"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useEffect } from "react";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { AuthService } from "@/src/lib/services/auth";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useProfile } from "../lib/hooks/userProfile";

export type AddressFormRM = {
    name: string;
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
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const { user } = useProfile();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormRM>({
        defaultValues: {
            taggedAs: "Home",
            ...defaultValues,
        },
    });
    useEffect(() => {
        if (defaultValues) {
            const mappedData = mapAddressToForm(defaultValues);

            reset(mappedData);
        }
    }, [defaultValues, reset]);
    useEffect(() => {
        if (!user || defaultValues) return;

        setValue("firstName", user.firstName || "");
        setValue("lastName", user.lastName || "");

        if (user.mobile) {
            setValue("mobileNumber", user.mobile);
            setValue("mobileNumberCode", user.countryCode?.replace("+", "") || "");
            setValue("mobileNumberSortCode", user.sortCountryCode || "");
        }
    }, [user, defaultValues, setValue]);

    const taggedAs = watch("taggedAs");
    const mobileNumber = watch("mobileNumber");
    const mobileCode = watch("mobileNumberCode");
    const askLocationPermission = () => {
        if (!("geolocation" in navigator)) return;

        navigator.geolocation.getCurrentPosition(
            () => {
                // Permission granted — do nothing
            },
            () => {
                // Permission denied — do nothing
            }
        );
    };
    useEffect(() => {
        askLocationPermission();
    }, []);
    const mapAddressToForm = (data: any): AddressFormRM => {
        // split name safely
        const nameParts = (data.name || "").trim().split(" ");

        return {
            ...data,

            // ✅ split name
            firstName: data.firstName || nameParts[0] || "",
            lastName:
                data.lastName ||
                    nameParts.length > 1
                    ? nameParts.slice(1).join(" ")
                    : "",

            // ✅ ensure required fields exist
            taggedAs: data.taggedAs || "Home",

            mobileNumber: data.mobileNumber || "",
            mobileNumberCode: data.mobileNumberCode || "",
            mobileNumberSortCode: data.mobileNumberSortCode || "",

            addLine1: data.addLine1 || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || data.countryName || "", // 👈 important fix
            pincode: data.pincode || "",
            landmark: data.landmark || "",
        };
    };

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

    const requestLocation = () => {
        if (!("geolocation" in navigator)) {
            toast.error("Geolocation not supported by your browser");
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                setCoords({ latitude, longitude });

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    const data = await response.json();

                    if (data?.address) {
                        const addressLine = data.display_name || "";

                        const city =
                            data.address.city ||
                            data.address.town ||
                            data.address.village ||
                            "";

                        const state = data.address.state || "";
                        const pincode = data.address.postcode || "";
                        const country = data.address.country || "";

                        setValue("addLine1", addressLine, { shouldValidate: true });
                        setValue("city", city, { shouldValidate: true });
                        setValue("state", state, { shouldValidate: true });
                        setValue("pincode", pincode, { shouldValidate: true });
                        setValue("country", country, { shouldValidate: true });
                    }

                    toast.success("Location auto-filled successfully");
                } catch {
                    toast.error("Failed to fetch address details");
                } finally {
                    setLoadingLocation(false);
                }
            },
            (error) => {
                toast.error(error.message || "Failed to get location");
                setLoadingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };



    return (
        <form
            onSubmit={handleSubmit(async (data) => {
                await onSubmit({
                    ...data,
                    name: `${data.firstName} ${data.lastName}`,
                });
            })}
            className="space-y-5"
        >

            {/* Personal Info */}
            <section className="bg-gray-50 p-4 sm:p-5 rounded-2xl">
                <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
                    {t("personalInformation")}
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* First Name */}
                    <div className="space-y-2">
                        <Label required error={!!errors.firstName}>
                            {t("firstName")}
                        </Label>
                        <Input
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
                        <Label required error={!!errors.lastName}>
                            {t("lastName")}
                        </Label>
                        <Input
                            placeholder={t("lastNamePlaceholder")}
                            error={!!errors.lastName}
                            {...register("lastName", {
                                required: t("lastNameRequired"),
                            })}
                        />
                        <ErrorMessage message={errors.lastName?.message} />
                    </div>

                    {/* Mobile */}
                    <div className="md:col-span-2 space-y-2">
                        <Label required>{t("mobile")}</Label>
                        <div className="phone-input">
                            <PhoneInput
                                country="us"
                                value={`${mobileCode || ""}${mobileNumber || ""}`}
                                containerClass="!w-full"
                                inputClass="!w-full !h-[44px] !rounded-lg !border-[#2f2f2f] focus:!border-[#f3c200] !text-sm !pl-14"
                                onChange={(value, country: any) => {
                                    setValue("mobileNumber", value.replace(country.dialCode, ""));
                                    setValue("mobileNumberCode", country.dialCode);
                                    setValue("mobileNumberSortCode", country.countryCode);
                                }}
                            />
                        </div>
                        <ErrorMessage message={errors.mobileNumber?.message} />
                    </div>

                </div>
            </section>

            {/* Address */}
            <section className="bg-gray-50 p-4 sm:p-5 rounded-2xl">
                <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
                    {t("paymentInformation")}
                </h2>

                <div className="space-y-4">

                    {/* Address Line */}
                    <div className="space-y-2">
                        <Label required error={!!errors.addLine1}>
                            {t("address")}
                        </Label>

                        <Textarea
                            className="!border-[#2f2f2f] focus:!border-[#f3c200] focus:outline-0 focus:ring-0"
                            rows={3}
                            placeholder={t("addressPlaceholder")}
                            error={!!errors.addLine1}
                            {...register("addLine1", {
                                required: t("addressRequired"),
                            })}
                        />

                        <ErrorMessage message={errors.addLine1?.message} />
                        <Button
                            className="btn-primary"
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={requestLocation}
                            disabled={loadingLocation}
                        >
                            <svg className="w-3 h-3" x="0" y="0" viewBox="0 0 512 512"><g><path d="M256 0C153.755 0 70.573 83.182 70.573 185.426c0 126.888 165.939 313.167 173.004 321.035 6.636 7.391 18.222 7.378 24.846 0 7.065-7.868 173.004-194.147 173.004-321.035C441.425 83.182 358.244 0 256 0zm0 278.719c-51.442 0-93.292-41.851-93.292-93.293S204.559 92.134 256 92.134s93.291 41.851 93.291 93.293-41.85 93.292-93.291 93.292z" fill="#fff" opacity="1" data-original="#000000"></path></g></svg>
                            {loadingLocation ? "detecting" : t("useCurrentLocation")}
                        </Button>

                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Country */}
                        <div className="space-y-2">
                            <Label required error={!!errors.country}>
                                {t("country")}
                            </Label>

                            <select
                                className={`
      w-full rounded-lg border bg-background
      px-3 py-3 text-sm
      transition-colors duration-200
      focus:outline-none focus:ring-0 !border-[#2f2f2f] focus:!border-[#f3c200]
      h-11
      ${errors.country
                                        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                                        : "border-gray-300 hover:border-gray-400"}
    `}
                                {...register("country", {
                                    required: t("countryRequired"),
                                })}
                                disabled={countriesLoading}
                            >
                                <option value="">{t("selectCountry")}</option>
                                {countries.map((c) => (
                                    <option key={c._id} value={c.name} data-code={c.countryCode}>
                                        {c.emoji} {c.name}
                                    </option>
                                ))}
                            </select>

                            <ErrorMessage message={errors.country?.message} />
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <Label required error={!!errors.city}>
                                {t("city")}
                            </Label>

                            <Input
                                placeholder={t("cityPlaceholder")}
                                error={!!errors.city}
                                {...register("city", {
                                    required: t("cityRequired"),
                                })}
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

                        {/* Landmark */}
                        <div className="space-y-2 sm:col-span-2">
                            <Label required error={!!errors.landmark}>
                                {t("landmark")}
                            </Label>

                            <Input
                                placeholder={t("landmarkPlaceholder")}
                                error={!!errors.landmark}
                                {...register("landmark", {
                                    required: t("landmarkRequired"),
                                })}
                            />

                            <ErrorMessage message={errors.landmark?.message} />
                        </div>

                    </div>

                </div>
            </section>


            {/* Address Type */}
            <section className="bg-gray-50 p-4 sm:p-5 rounded-2xl">
                <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
                    {t("addressType")}
                </h2>

                <div className="grid grid-cols-3 gap-3 mb-3">
                    {["Home", "Office", "Other"].map((key) => (
                        <Button
                            className="text-[#2f2f2f]"
                            key={key}
                            type="button"
                            variant={taggedAs === key ? "primary" : "outline"}
                            size="sm"
                            onClick={() =>
                                setValue("taggedAs", key as AddressFormRM["taggedAs"])
                            }
                        >
                            {t(`addressType${key}`)}
                        </Button>
                    ))}
                </div>

                {taggedAs === "Other" && (
                    <div className="space-y-2">
                        <Input
                            placeholder={t("addressTypeOtherPlaceholder")}
                            error={!!errors.taggedAsLabel}
                            {...register("taggedAsLabel", {
                                required: t("addressTypeOtherRequired"),
                            })}
                        />
                        <ErrorMessage message={errors.taggedAsLabel?.message} />
                    </div>
                )}
            </section>

            <Button
                type="submit"
                className="btn-primary w-full h-11"
                disabled={isSubmitting}
            >
                {isSubmitting ? t("saving") : t("continue")}
            </Button>

        </form>
    );
}
