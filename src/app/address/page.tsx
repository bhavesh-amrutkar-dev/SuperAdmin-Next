"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useEffect } from "react";

import { AuthService } from "@/src/lib/services/auth";
import Header from "@/src/components/layout/Header";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import Footer from "@/src/components/layout/Footer";
import { CountryCurrency } from "@/src/models/api/response/auth";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useProfile } from "@/src/lib/hooks/userProfile";
import { getCookie } from "cookies-next";

type AddressFormRM = {
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
    countryId: string;
};

const DEFAULT_COORDS = {
    latitude: 0.0,
    longitude: 0.0,
};
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

export default function AddressPage() {
    const t = useTranslations();
    const router = useRouter();
    const defaultCountry = (getCookie("C_code") as string || "pr").toLowerCase();

    const [countries, setCountries] = useState<CountryCurrency[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const { user } = useProfile();
    // useEffect(() => {
    //     console.log(user);

    //     if (user === undefined) return; // still loading profile

    //     if (!user) {
    //         router.replace("/auth/login");
    //     }
    // }, [user, router]);


    const requestLocation = async () => {
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
                    // 🔥 OpenStreetMap Reverse Geocode (FREE)
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

                        // ✅ Prefill fields
                        setValue("addLine1", addressLine, { shouldValidate: true });
                        setValue("city", city, { shouldValidate: true });
                        setValue("state", state, { shouldValidate: true });
                        setValue("pincode", pincode, { shouldValidate: true });
                        setValue("country", country, { shouldValidate: true });
                    }

                    toast.success("Location detected successfully");
                } catch (error) {
                    toast.error("Failed to fetch address details");
                }
                finally {
                    setLoadingLocation(false);
                }
            },
            () => {
                toast.error("Unable to retrieve your location");
                setLoadingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

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


    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormRM>({
        defaultValues: { taggedAs: "Home" },
    });
    useEffect(() => {
        if (countries.length > 0) {
            const countryId = user?.countryId || "633a6c3dd17f0000ea00102e";

            setValue("countryId", countryId);

            const selectedCountry = countries.find(c => c._id === countryId);

            if (selectedCountry) {
                setValue("country", selectedCountry.name);
            }
        }
    }, [countries, user, setValue]);
    useEffect(() => {
        if (!user) return;
        setValue("firstName", user.firstName || "");
        setValue("lastName", user.lastName || "");
        // Mobile handling
        if (user.mobile) {
            setValue("mobileNumber", user.mobile);
            setValue("mobileNumberCode", user.countryCode?.replace("+", "") || "");
            setValue("mobileNumberSortCode", user.sortCountryCode || "");
        }
    }, [user, setValue]);

    const taggedAs = watch("taggedAs");
    useEffect(() => {
        const fetchCountries = async () => {

            setCountriesLoading(true);
            try {
                const res = await AuthService.getCurrency();

                setCountries(mapCountryCurrency(res?.data ?? []));
            } catch {
                toast.error("Failed to load countries");
            } finally {
                setCountriesLoading(false);
            }
        };

        fetchCountries();
    }, []);

    const onSubmit = async (data: AddressFormRM) => {
        try {
            const payload = {
                // ✅ name
                name: `${data.firstName} ${data.lastName}`.trim(),

                // ✅ address
                addLine1: `${data.city}, ${data.state}, ${data.country}`,
                city: data.city,
                state: data.state,
                country: data.country,
                countryId: data.countryId,
                pincode: data.pincode,
                landmark: data.landmark,

                // ✅ mobile
                mobileNumber: data.mobileNumber?.trim(),
                mobileNumberCode: data.mobileNumberCode,
                mobileNumberSortCode: data.mobileNumberSortCode?.toLowerCase(),

                // ✅ REQUIRED
                countryCode: data.mobileNumberSortCode?.toUpperCase(),

                // ✅ geo
                latitude: coords?.latitude ?? DEFAULT_COORDS.latitude,
                longitude: coords?.longitude ?? DEFAULT_COORDS.longitude,

                // ✅ tagging
                tagged:
                    data.taggedAs === "Home"
                        ? 1
                        : data.taggedAs === "Office"
                            ? 2
                            : 3,

                taggedAs:
                    data.taggedAs === "Other"
                        ? data.taggedAsLabel?.trim() || "Other"
                        : data.taggedAs,

                // ✅ default flag
                default: false,

            };

            await AuthService.createAddress(payload);

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

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 px-6 py-8">

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
                                    {countriesLoading || countries.length === 0 ? (
                                        <div className="w-full h-[44px] rounded-lg border border-[#2f2f2f] px-4 flex items-center text-sm text-gray-400">
                                            Loading...
                                        </div>
                                    ) : (
                                        <PhoneInput
                                            country={defaultCountry}
                                            containerClass="!w-full"
                                            onlyCountries={countries.map(c => c.countryCode.toLowerCase())}
                                            inputClass="!w-full !h-[44px] !rounded-lg !border !border-gray-300 !text-sm !pl-14 focus:!border-[#f3c200] focus:!ring-2 focus:!ring-yellow-200"
                                            onChange={(value, country: any) => {
                                                const numberWithoutCode = value.replace(country.dialCode, "");

                                                setValue("mobileNumber", numberWithoutCode, {
                                                    shouldValidate: true,
                                                });

                                                setValue("mobileNumberCode", country.dialCode);
                                                setValue("mobileNumberSortCode", country.countryCode);

                                                // 🔥 trigger validation immediately
                                                trigger("mobileNumber");
                                            }}
                                        />)}
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


                                    {/* <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={requestLocation}
                                        disabled={loadingLocation}
                                    >
                                        {loadingLocation ? t("detecting") : t("useCurrentLocation")}
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
                                            className={`
    w-full rounded-lg border bg-background
    px-4 py-2 text-sm
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-[#f3c200]
    ${errors.countryId
                                                    ? "border-red-500"
                                                    : "border-gray-300 hover:border-gray-400"}
  `}
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
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </>
    );
}
