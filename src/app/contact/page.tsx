"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { contactUsBanner, Contate_girl } from "@/src/lib/config";

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

            <div className="w-full bg-white">
                <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8 md:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Banner & Image */}
                        <div className="space-y-6">
                            {/* Yellow Banner */}
                            <div className="bg-[#f3c200] px-6 py-4 rounded-lg">
                                <h1 className="text-2xl md:text-3xl font-bold uppercase text-[#2f2f2f] tracking-wide">
                                    {t("contactUs") || "CONTACT US"}
                                </h1>
                            </div>

                            {/* Contact Image */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                                <Image
                                    src={Contate_girl || contactUsBanner || "/images/contactUs/contactUsBanner.png"}
                                    alt="Contact Us"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* Middle Column - Company Information */}
                        <div className="space-y-6">
                            <h2 className="text-xl md:text-2xl font-bold text-[#2f2f2f] uppercase mb-4">
                                {t("companyInformation") || "COMPANY INFORMATION"} :
                            </h2>
                            <div className="space-y-4 text-[#797979]">
                                <div>
                                    <p className="leading-relaxed">
                                        1413 PR-25 4to piso, Puerto Rico
                                    </p>
                                    <p className="leading-relaxed">25,DON RIFA LLC</p>
                                    <p className="leading-relaxed">San Juan San Juan, 00918</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-[#2f2f2f] mb-1">
                                        {t("email")} -
                                    </p>
                                    <a
                                        href="mailto:service@donrifa.com"
                                        className="text-[#797979] hover:text-[#f3c200] transition-colors"
                                    >
                                        service@donrifa.com
                                    </a>
                                </div>
                                <div>
                                    <p className="font-semibold text-[#2f2f2f] mb-1">
                                        {t("phoneNumber") || "Phone Number"}.
                                    </p>
                                    <a
                                        href="tel:434497151"
                                        className="text-[#797979] hover:text-[#f3c200] transition-colors"
                                    >
                                        434497151
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="space-y-6">
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

