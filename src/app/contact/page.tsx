"use client";

import { useEffect, useState } from "react";
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
import ErrorMessage from "@/src/components/ui/errorMessage";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useProfile } from "@/src/lib/hooks/userProfile";

type ContactForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneCode: string;
    query: string;
};

type Errors = Partial<Record<keyof ContactForm, string>>;
// Contact page component

export default function ContactPage() {
    
    const t = useTranslations();
    const [formData, setFormData] = useState<ContactForm>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phoneCode: "+1",
        query: "",
    });

    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const { user } = useProfile();

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.mobile || user.number || "",
                phoneCode: user.countryCode || "+1",
            }));
        }
    }, [user]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhoneCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, phoneCode: e.target.value }));
    };
    const validate = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.firstName.trim())
            newErrors.firstName = t("firstNameRequired");

        if (!formData.lastName.trim())
            newErrors.lastName = t("lastNameRequired");

        if (!formData.email) {
            newErrors.email = t("emailRequired");
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = t("emailInvalid");
        }

        if (!formData.query.trim())
            newErrors.query = t("messageRequired");

        // phone optional — validate only if filled
        if (formData.phone && formData.phone.length < 6)
            newErrors.phone = t("invalidMobile");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            // TODO: API call
            await new Promise((res) => setTimeout(res, 1000));

            alert(t("messageSent"));
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                phoneCode: "+1",
                query: "",
            });
            setErrors({});
        } finally {
            setLoading(false);
        }
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
                                        <Label htmlFor="firstName" error={!!errors.firstName} required>
                                            {t("firstName")}
                                        </Label>

                                        <Input
                                            id="firstName"
                                            placeholder={t("firstNamePlaceholder")}
                                            value={formData.firstName}
                                            error={!!errors.firstName}
                                            onChange={(e) => {
                                                setFormData({ ...formData, firstName: e.target.value });
                                                setErrors({ ...errors, firstName: undefined });
                                            }}
                                        />

                                        <ErrorMessage message={errors.firstName} />
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" error={!!errors.lastName} required>
                                            {t("lastName")}
                                        </Label>
                                        <Input
                                            id="lastName"
                                            placeholder={t("lastNamePlaceholder")}
                                            value={formData.lastName}
                                            error={!!errors.lastName}
                                            onChange={(e) => {
                                                setFormData({ ...formData, lastName: e.target.value });
                                                setErrors({ ...errors, lastName: undefined });
                                            }}
                                        />

                                        <ErrorMessage message={errors.lastName} />
                                    </div>

                                    {/* Email */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="email" error={!!errors.email} required>
                                            {t("email")}
                                        </Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            error={!!errors.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                                setErrors({ ...errors, email: undefined });
                                            }}
                                        />

                                        <ErrorMessage message={errors.email} />
                                    </div>

                                    {/* Phone */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="phone">
                                            {t("phone")}
                                        </Label>

                                        <PhoneInput
                                            inputProps={{
                                                id: "phone",
                                                // placeholder: t("mobilePlaceholder") || "Enter phone number",
                                            }}
                                            country="us"
                                            value={
                                                formData.phone
                                                    ? `${formData.phoneCode}${formData.phone}`
                                                    : ""
                                            }
                                            onChange={(value, country) => {
                                                if (!("dialCode" in country)) return;

                                                const dialCode = `+${country.dialCode}`;
                                                const mobile = value.slice(country.dialCode.length);

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    phoneCode: dialCode,
                                                    phone: mobile,
                                                }));

                                                setErrors((prev) => ({ ...prev, phone: undefined }));
                                            }}
                                            specialLabel=""
                                            inputClass={`
    !w-full !h-[44px] !rounded-lg
    !border ${errors.phone ? "!border-red-500" : "!border-input"}
    !pl-14 !text-sm
    focus:!border-[#f3c200]
    focus:!ring-2 focus:!ring-yellow-200
  `}
                                        />

                                        <ErrorMessage message={errors.phone} />
                                    </div>

                                    {/* Message */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="query" error={!!errors.query} required>
                                            {t("message")}
                                        </Label>

                                        <textarea
                                            id="query"
                                            value={formData.query}
                                            placeholder={t("messagePlaceholder")}
                                            onChange={(e) => {
                                                setFormData({ ...formData, query: e.target.value });
                                                setErrors({ ...errors, query: undefined });
                                            }}
                                            className={`
    w-full rounded-lg px-4 py-3 text-sm
    transition-all duration-200
    ${errors.query
                                                    ? "border border-red-500 focus:ring-red-200"
                                                    : "border border-input focus:border-[#f3c200] focus:ring-2 focus:ring-yellow-200"}
  `}
                                        />

                                        <ErrorMessage message={errors.query} />
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

