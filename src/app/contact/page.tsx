"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { contactUsBanner, Contate_girl } from "@/src/lib/config";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import PhoneInput from "react-phone-input-2";

// Contact page component

export default function ContactPage() {
    const t = useTranslations();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phoneCode: "+1",
        query: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhoneCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, phoneCode: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Implement API call
        setTimeout(() => {
            setLoading(false);
            alert(t("messageSent") || "Message sent successfully!");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                phoneCode: "+1",
                query: "",
            });
        }, 1000);
    };

    return (
        <main>
            <Header />

            <div className="w-full bg-linear-to-b from-gray-50 to-white min-h-screen">
                <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8 md:py-16">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            {t("contactUs") || "CONTACT US"}
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            {t("contactUsDescription") || "Get in touch with us. We're here to help!"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                        {/* LEFT COLUMN */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-full max-w-md aspect-4/5 overflow-hidden rounded-3xl shadow-2xl">
                                <Image
                                    src={Contate_girl || contactUsBanner || "/images/contactUs/contactUsBanner.png"}
                                    alt="Contact Us"
                                    fill
                                    className="object-cover"

                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-8">

                            {/* Company Info Card */}
                            <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-[#D4AF37] rounded-full"></div>
                                    {t("companyInformation") || "COMPANY INFORMATION"}
                                </h2>

                                <div className="space-y-8">
                                    {/* Address */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-all duration-300">
                                            <MapPin className="w-5 h-5 text-[#D4AF37] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {t("address") || "Address"}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                1413 PR-25 4to piso, Puerto Rico<br />
                                                25, DON RIFA LLC<br />
                                                San Juan, 00918
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-all duration-300">
                                            <Mail className="w-5 h-5 text-[#D4AF37] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {t("email") || "Email"}
                                            </h3>
                                            <a
                                                href="mailto:service@donrifa.com"
                                                className="text-[#D4AF37] hover:text-[#B8860B] transition-colors font-medium text-sm"
                                            >
                                                service@donrifa.com
                                            </a>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-all duration-300">
                                            <Phone className="w-5 h-5 text-[#D4AF37] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {t("phoneNumber") || "Phone"}
                                            </h3>
                                            <a
                                                href="tel:434497151"
                                                className="text-[#D4AF37] hover:text-[#B8860B] transition-colors font-medium text-sm"
                                            >
                                                434 497 151
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form Card */}
                            <div className="bg-white rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-6 sm:p-8">
                                <div className="mb-6 text-center">
                                    <h2 className="text-2xl font-bold section_title">
                                        {t("sendMessage")}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" required>
                                            {t("firstName")}
                                        </Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" required>
                                            {t("lastName")}
                                        </Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="email" required>
                                            {t("email")}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="phone">
                                            {t("phone")}
                                        </Label>

                                        <PhoneInput
                                            inputProps={{ id: "phone" }}
                                            country="us"
                                            value={`${formData.phoneCode}${formData.phone}`}
                                            onChange={(value, country) => {
                                                if (!("dialCode" in country)) return;

                                                const dialCode = `+${country.dialCode}`;
                                                const mobile = value.replace(country.dialCode, "");

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    phoneCode: dialCode,
                                                    phone: mobile,
                                                }));
                                            }}
                                            inputClass="
          !w-full !h-[44px] !rounded-lg
          !border !border-input
          !pl-14 !text-sm
          focus:!border-[#f3c200]
          focus:!ring-2 focus:!ring-yellow-200
        "
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="query" required>
                                            {t("message")}
                                        </Label>
                                        <textarea
                                            id="query"
                                            name="query"
                                            value={formData.query}
                                            onChange={handleChange}
                                            rows={5}
                                            className="
          w-full rounded-lg border border-input
          px-4 py-3 text-sm
          focus:outline-none
          focus:!border-[#f3c200]
          focus:!ring-2 focus:!ring-yellow-200
          transition-all duration-200
        "
                                        />
                                    </div>

                                    {/* Button */}
                                    <button
                                        disabled={loading}
                                        className="
        md:col-span-2 w-full rounded-lg btn-primary py-3 font-semibold
        hover:bg-yellow-400 hover:text-black transition
        disabled:opacity-50 mt-3
      "
                                    >
                                        {loading ? t("sending") : t("send")}
                                    </button>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

