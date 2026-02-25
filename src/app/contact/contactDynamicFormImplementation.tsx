"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { AuthService } from "@/src/lib/services/auth";
import { toast } from "sonner";



export default function ContactPage() {
    type ContactField = {
        _id: string;
        title: string;
        type: number;
        mandatory: boolean;
        titleLan: {
            en: string;
            es: string;
        };
        sequence: number;
    };

    const [fields, setFields] = useState<ContactField[]>([]);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const t = useTranslations();


    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { user } = useProfile();
    const locale = useLocale();
    useEffect(() => {
        if (!user || fields.length === 0) return;

        setFormValues((prev) => {
            const updated = { ...prev };

            fields.forEach((field) => {
                if (!updated[field._id]) {
                    if (field.title === "First Name")
                        updated[field._id] = user.firstName || "";

                    if (field.title === "Last Name")
                        updated[field._id] = user.lastName || "";

                    if (field.title === "Email")
                        updated[field._id] = user.email || "";

                    if (field.title === "Phone Number")
                        updated[field._id] = user.mobile || "";
                }
            });

            return updated;
        });
    }, [user, fields]);
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await AuthService.getContactFormFields("0");

                const sorted = res.data.data.sort(
                    (a: ContactField, b: ContactField) =>
                        a.sequence - b.sequence
                );

                setFields(sorted);

                const initialValues: Record<string, string> = {};
                sorted.forEach((field: ContactField) => {
                    initialValues[field._id] = "";
                });

                setFormValues(initialValues);
            } catch (err: any) {
                toast.error(err?.message || "Failed to load contact form");
            }
        };

        fetchFields();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            await AuthService.createContactRequest({
                storeId: "0",
                form: fields.map((field) => ({
                    fieldId: field._id,
                    title: field.title,
                    value: formValues[field._id] || "",
                    titleLan: field.titleLan,
                })),
            });

            toast.success(t("messageSent"));
            setFormValues({});
        } catch (err: any) {
            toast.error(err?.message || t("messageFailed"));
        } finally {
            setLoading(false);
        }
    };
    const validate = () => {
        const newErrors: Record<string, string> = {};

        fields.forEach((field) => {
            const value = formValues[field._id];

            if (field.mandatory && !value?.trim()) {
                newErrors[field._id] = `${field.title} is required`;
            }

            if (field.type === 2 && value) {
                if (!/^\S+@\S+\.\S+$/.test(value)) {
                    newErrors[field._id] = "Invalid email";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

                                    {fields.map((field) => {
                                        const label = field.titleLan?.[locale] || field.title;

                                        return (
                                            <div
                                                key={field._id}
                                                className={`space-y-2 ${field.type === 5 ? "md:col-span-2" : ""}`}
                                            >
                                                <Label required={field.mandatory}>
                                                    {field.titleLan?.[locale] || field.title}
                                                </Label>

                                                {(field.type === 1 || field.type === 2 || field.type === 6) && (
                                                    <Input
                                                        type={
                                                            field.type === 2
                                                                ? "email"
                                                                : field.type === 1
                                                                    ? "tel"
                                                                    : "text"
                                                        }
                                                        value={formValues[field._id] || ""}
                                                        onChange={(e) =>
                                                            setFormValues((prev) => ({
                                                                ...prev,
                                                                [field._id]: e.target.value,
                                                            }))
                                                        }
                                                        error={!!errors[field._id]}
                                                    />
                                                )}

                                                {field.type === 5 && (
                                                    <textarea
                                                        className={`w-full rounded-lg px-4 py-3 text-sm border ${errors[field._id]
                                                            ? "border-red-500"
                                                            : "border-input"
                                                            }`}
                                                        value={formValues[field._id] || ""}
                                                        onChange={(e) =>
                                                            setFormValues((prev) => ({
                                                                ...prev,
                                                                [field._id]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                )}

                                                <ErrorMessage message={errors[field._id]} />
                                            </div>
                                        );
                                    })}
                                    <button
                                        disabled={loading}
                                        className="md:col-span-2 btn-primary mt-4 disabled:opacity-50"
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

