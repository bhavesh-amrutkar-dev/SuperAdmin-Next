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
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

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
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
        >

            {/* Personal Info */}
            <section className="space-y-5">
                <h2 className="text-sm font-semibold uppercase text-gray-600">
                    {t("personalInformation")}
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

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
                        <PhoneInput
                            country="us"
                            containerClass="!w-full"
                            inputClass="!w-full !h-[44px] !rounded-lg !border !border-gray-300 !text-sm !pl-14 focus:!border-[#f3c200] focus:!ring-2 focus:!ring-yellow-200"
                            onChange={(value, country: any) => {
                                setValue("mobileNumber", value.replace(country.dialCode, ""));
                                setValue("mobileNumberCode", country.dialCode);
                                setValue("mobileNumberSortCode", country.countryCode);
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
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={requestLocation}
                            disabled={loadingLocation}
                        >
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
      px-4 py-2 text-sm
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-[#f3c200]
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
                        <div className="space-y-2">
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
            <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase text-gray-600">
                    {t("addressType")}
                </h2>

                <div className="grid grid-cols-3 gap-3">
                    {["Home", "Office", "Other"].map((key) => (
                        <Button
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
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? t("saving") : t("continue")}
            </Button>

        </form>
    );
}
