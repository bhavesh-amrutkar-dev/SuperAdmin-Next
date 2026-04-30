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
import { getCookie } from "cookies-next";

export type AddressFormRM = {
    // 👤 UI fields
    firstName: string;
    lastName: string;

    addLine1: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    landmark: string;

    // 📞 Mobile
    mobileNumber: string;
    mobileNumberCode: string;
    mobileNumberSortCode: string;

    // 🏷️ Tagging
    taggedAs: "Home" | "Office" | "Other";
    taggedAsLabel?: string;

    // ⚙️ Optional / computed (used during edit or submit)
    name?: string;
    tagged?: number;
    countryCode?: string;

    latitude?: number;
    longitude?: number;

    default?: boolean;
    countryId: string;
};
const inputBase =
    "w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400";

const getFlagEmoji = (countryCode: string) => {
    return countryCode
        ?.toUpperCase()
        .replace(/./g, (char) =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
        );
};
const mapCountryCurrency = (data: any[]): CountryCurrency[] => {
    return data.map((c) => ({
        _id: c._id,
        name: c.countryName,
        countryCode: c.countryCode,
        countryCodeAlpha3: "", // optional (fill later if needed)
        currencyCode: c.currencyShortCode,
        currencyName: "", // optional
        currencySymbol: c.currencySymbol,
        countryCodeMobile: "", // optional
        emoji: getFlagEmoji(c.countryCode),
        ioc: "", // optional
    }));
};
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
    const defaultCountry = (getCookie("C_code") as string || "pr").toLowerCase();
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
        trigger,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormRM>({
        defaultValues: {
            taggedAs: "Home",
            ...defaultValues,
        },
    });
    useEffect(() => {
        if (defaultValues && countries.length > 0) {
            const mappedData = mapAddressToForm(defaultValues);

            reset({
                ...mappedData,
                countryId: mappedData.countryId || "",
            });
        }
    }, [defaultValues, countries, reset]);
    useEffect(() => {
        if (defaultValues?.countryId) {
            setValue("countryId", defaultValues.countryId);
        }
    }, [defaultValues, setValue]);
    useEffect(() => {
        if (!user || defaultValues) return;

        setValue("firstName", user.firstName || "");
        setValue("lastName", user.lastName || "");

        if (user.mobile) {
            // setValue("mobileNumber", user.mobile);
            // setValue("mobileNumberCode", user.countryCode?.replace("+", "") || "");
            // setValue("mobileNumberSortCode", user.sortCountryCode || "");
        }
    }, [user, defaultValues, setValue]);

    const taggedAs = watch("taggedAs");
    const mobileNumber = watch("mobileNumber");
    const mobileCode = watch("mobileNumberCode");
    const mobileSortCode = watch("mobileNumberSortCode");

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
        const nameParts = (data.name || "").trim().split(" ");

        let taggedAs: AddressFormRM["taggedAs"] = "Home";
        let taggedAsLabel = "";

        // 🔥 FIX LOGIC
        if (data.tagged === 1) taggedAs = "Home";
        else if (data.tagged === 2) taggedAs = "Office";
        else if (data.tagged === 3) {
            taggedAs = "Other";
            taggedAsLabel = data.taggedAs || "";
        }

        return {
            ...data,

            firstName: data.firstName || nameParts[0] || "",
            lastName:
                data.lastName ||
                (nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""),

            // ✅ FIXED
            taggedAs,
            taggedAsLabel,

            mobileNumber: data.mobileNumber || "",
            mobileNumberCode: data.mobileNumberCode || "",
            mobileNumberSortCode: data.mobileNumberSortCode || "",

            addLine1: data.addLine1 || "",
            city: data.city || "",
            state: data.state || "",
            country: data.countryName || data.country || "",
            pincode: data.pincode || "",
            landmark: data.landmark || "",
            countryId: data.countryId,
        };
    };
    useEffect(() => {
        if (taggedAs !== "Other") {
            setValue("taggedAsLabel", "");
        }
    }, [taggedAs, setValue]);
    useEffect(() => {
        const fetchCountries = async () => {
            setCountriesLoading(true);
            try {
                const res = await AuthService.getCurrency();

                setCountries(mapCountryCurrency(res?.data ?? []));
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

    const noWhiteSpaceOnly = (value: string, message: string) => {
        if (!value || value.trim().length === 0) {
            return message;
        }
        return true;
    };

    return (
        <form
            onSubmit={handleSubmit(async (data) => {
                const cleanedData = {
                    ...data,
                    firstName: data.firstName.trim(),
                    lastName: data.lastName.trim(),
                    addLine1: data.addLine1.trim(),
                    city: data.city.trim(),
                    state: data.state.trim(),
                    landmark: data.landmark.trim(),
                };

                await onSubmit({
                    ...cleanedData,
                    name: `${cleanedData.firstName} ${cleanedData.lastName}`,
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
                                validate: (value) =>
                                    noWhiteSpaceOnly(value, t("firstNameRequired")),
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
                                validate: (value) =>
                                    noWhiteSpaceOnly(value, t("lastNameRequired")),
                            })}
                        />
                        <ErrorMessage message={errors.lastName?.message} />
                    </div>

                    {/* Mobile */}
                    <div className="md:col-span-2 space-y-2">
                        <Label required>{t("mobile")}</Label>
                        <div className="phone-input">
                            {countriesLoading || countries.length === 0 ? (
                                <div className="w-full h-[44px] rounded-lg border border-[#2f2f2f] px-4 flex items-center text-sm text-gray-400">
                                    Loading...
                                </div>
                            ) : (
                                <PhoneInput
                                    key={mobileSortCode || defaultCountry}
                                    country={mobileSortCode?.toLowerCase() || defaultCountry}
                                    value={`${mobileCode || ""}${mobileNumber || ""}`}
                                    onlyCountries={countries.map(c => c.countryCode.toLowerCase())}
                                    containerClass="!w-full"
                                    inputClass="!w-full !h-[44px] !rounded-lg !border-[#2f2f2f] focus:!border-[#f3c200] !text-sm !pl-14"
                                    onChange={(value, country: any) => {
                                        const numberWithoutCode = value.replace(country.dialCode, "");

                                        setValue("mobileNumber", numberWithoutCode, {
                                            shouldValidate: true,
                                        });

                                        setValue("mobileNumberCode", country.dialCode);
                                        setValue("mobileNumberSortCode", country.countryCode);

                                        trigger("mobileNumber");
                                    }}
                                />
                            )}
                        </div>
                        <ErrorMessage message={errors.mobileNumber?.message} />
                    </div>
                    <input
                        type="hidden"
                        {...register("mobileNumber", {
                            required: t("mobileRequired"),
                            minLength: {
                                value: 7,
                                message: t("invalidMobile"),
                            },
                        })}
                    />
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
                                validate: (value) =>
                                    noWhiteSpaceOnly(value, t("addressRequired")),
                            })}
                        />

                        <ErrorMessage message={errors.addLine1?.message} />
                        {/* <Button
                            className="btn-primary"
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={requestLocation}
                            disabled={loadingLocation}
                        >
                            <svg className="w-3 h-3" x="0" y="0" viewBox="0 0 512 512"><g><path d="M256 0C153.755 0 70.573 83.182 70.573 185.426c0 126.888 165.939 313.167 173.004 321.035 6.636 7.391 18.222 7.378 24.846 0 7.065-7.868 173.004-194.147 173.004-321.035C441.425 83.182 358.244 0 256 0zm0 278.719c-51.442 0-93.292-41.851-93.292-93.293S204.559 92.134 256 92.134s93.291 41.851 93.291 93.293-41.85 93.292-93.291 93.292z" fill="#fff" opacity="1" data-original="#000000"></path></g></svg>
                            {loadingLocation ? "detecting" : t("useCurrentLocation")}
                        </Button> */}

                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Country */}
                        <div className="space-y-2">
                            <Label required error={!!errors.country}>
                                {t("country")}
                            </Label>
                            <select
                                value={watch("countryId") || ""}
                                disabled={countriesLoading}
                                onChange={(e) => {
                                    const selectedId = e.target.value;

                                    setValue("countryId", selectedId);

                                    const selectedCountry = countries.find(c => c._id === selectedId);

                                    if (selectedCountry) {
                                        setValue("country", selectedCountry.name);
                                    }
                                }}
                                className="w-full rounded-lg border px-3 py-3 text-sm"
                            >
                                <option value="">{t("selectCountry")}</option>
                                {countries.map((c) => (
                                    <option key={c._id} value={c._id}>
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
                                    validate: (value) =>
                                        noWhiteSpaceOnly(value, t("cityRequired")),
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
                                    validate: (value) =>
                                        noWhiteSpaceOnly(value, t("stateRequired")),
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
                                    validate: (value) =>
                                        noWhiteSpaceOnly(value, t("pincodeRequired")),
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
                                    validate: (value) =>
                                        noWhiteSpaceOnly(value, t("landmarkRequired")),
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
                                validate: (value) => {
                                    if (!value || value.trim().length === 0) {
                                        return t("addressTypeOtherRequired");
                                    }
                                    return true;
                                },
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
