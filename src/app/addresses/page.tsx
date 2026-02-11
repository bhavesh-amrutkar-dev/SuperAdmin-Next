"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { UserAddressService } from "@/src/lib/services/userAddress";

interface UserAddress {
    _id?: string;
    name?: string;
    addLine1?: string;
    addLine2?: string;
    flatNumber?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    countryCode?: string;
    emiratesRegionName?: string;
    mobileNumber?: string;
    mobileNumberCode?: string;
    default?: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations();
    const router = useRouter();

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await UserAddressService.getAddresses();
            const addressData = (response as any)?.data?.data || (response as any)?.data || [];
            setAddresses(Array.isArray(addressData) ? addressData : []);
        } catch (error: any) {
            console.error("Error fetching addresses:", error);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#ededed]">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
                        <p className="mt-4 text-gray-600">{t("loading") || "Loading..."}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ededed]">
            <Header />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">{t("savedAddresses")}</h1>
                        {/* <button
                            onClick={() => router.push("/profile?tab=addresses")}
                            className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            + {t("addAddress")}
                        </button> */}
                    </div>

                    {addresses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mb-4">
                                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("noAddressFound")}</h3>
                            {/* <button
                                onClick={() => router.push("/profile?tab=addresses")}
                                className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold py-2 px-6 rounded-lg transition-colors mt-4"
                            >
                                + {t("addAddress")}
                            </button> */}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className={`border-2 rounded-lg p-4 ${address.default ? "border-[#D4AF37] bg-yellow-50" : "border-gray-200"
                                        }`}
                                >
                                    {address.default && (
                                        <span className="inline-block bg-[#D4AF37] text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                                            {t("default")}
                                        </span>
                                    )}
                                    <h3 className="font-semibold text-gray-800 mb-2">{address.name || t("name")}</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {address.flatNumber && <p>{address.flatNumber}</p>}
                                        {address.addLine1 && <p>{address.addLine1}</p>}
                                        {address.addLine2 && <p>{address.addLine2}</p>}
                                        {address.locality && <p>{address.locality}</p>}
                                        <p>
                                            {address.city && `${address.city}, `}
                                            {address.state && `${address.state} `}
                                            {address.pincode && `${address.pincode}`}
                                        </p>
                                        {address.emiratesRegionName && <p>{address.emiratesRegionName}</p>}
                                        {address.country && <p>{address.country}</p>}
                                        {address.mobileNumber && (
                                            <p className="mt-2">
                                                {t("phoneNumber")}: {address.mobileNumberCode && `+${address.mobileNumberCode} `}
                                                {address.mobileNumber}
                                            </p>
                                        )}
                                    </div>
                                    {/* <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => router.push(`/profile?tab=addresses&edit=${address._id}`)}
                                            className="text-sm text-[#D4AF37] hover:text-[#B8860B] font-medium"
                                        >
                                            {t("edit")}
                                        </button>
                                    </div> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

