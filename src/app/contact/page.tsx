"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { contactUsBanner, Contate_girl } from "@/src/lib/config";
import { Mail, Phone, MapPin } from "lucide-react";

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

            <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-screen">
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
                        {/* Left Column - Image */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-gray-100 shadow-xl">
                                <Image
                                    src={Contate_girl || contactUsBanner || "/images/contactUs/contactUsBanner.png"}
                                    alt="Contact Us"
                                    fill
                                    className="object-cover rounded-2xl"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* Right Column - Company Information */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-[#D4AF37] rounded-full"></div>
                                    {t("companyInformation") || "COMPANY INFORMATION"}
                                </h2>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                                            <MapPin className="w-6 h-6 text-[#D4AF37] group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2">{t("address") || "Address"}</h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                1413 PR-25 4to piso, Puerto Rico<br />
                                                25, DON RIFA LLC<br />
                                                San Juan San Juan, 00918
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                                            <Mail className="w-6 h-6 text-[#D4AF37] group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2">{t("email")}</h3>
                                            <a
                                                href="mailto:service@donrifa.com"
                                                className="text-[#D4AF37] hover:text-[#B8860B] transition-colors font-medium break-all"
                                            >
                                                service@donrifa.com
                                            </a>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                                            <Phone className="w-6 h-6 text-[#D4AF37] group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2">{t("phoneNumber") || "Phone Number"}</h3>
                                            <a
                                                href="tel:434497151"
                                                className="text-[#D4AF37] hover:text-[#B8860B] transition-colors font-medium"
                                            >
                                                434497151
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form - Hidden */}
                        <div className="space-y-6 hidden">
                            <h2 className="text-xl md:text-2xl font-bold text-[#2f2f2f] uppercase mb-4">
                                {t("sendMessage") || "SEND MESSAGE"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* First Name */}
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-semibold text-[#2f2f2f] mb-2"
                                    >
                                        {t("firstName") || "First Name"} *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-semibold text-[#2f2f2f] mb-2"
                                    >
                                        {t("lastName") || "Last Name"} *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-semibold text-[#2f2f2f] mb-2"
                                    >
                                        {t("email")} *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Phone Number with Country Code */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-semibold text-[#2f2f2f] mb-2"
                                    >
                                        {t("phone") || "Phone"}
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="phoneCode"
                                            value={formData.phoneCode}
                                            onChange={handlePhoneCodeChange}
                                            className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent bg-white"
                                        >
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+52">🇲🇽 +52</option>
                                            <option value="+1-787">🇵🇷 +1-787</option>
                                            <option value="+1-809">🇩🇴 +1-809</option>
                                        </select>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder={t("enterPhoneNumber") || "Enter Phone Number"}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Query/Message */}
                                <div>
                                    <label
                                        htmlFor="query"
                                        className="block text-sm font-semibold text-[#2f2f2f] mb-2"
                                    >
                                        {t("enterYourQuery") || "Enter Your Query"} *
                                    </label>
                                    <textarea
                                        id="query"
                                        name="query"
                                        value={formData.query}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent resize-none"
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#9B9B9B] text-white py-3 px-6 rounded-lg font-semibold uppercase hover:bg-[#7A7A7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t("sending") || "Sending..." : t("send") || "SEND"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

