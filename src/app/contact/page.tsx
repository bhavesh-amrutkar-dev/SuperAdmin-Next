"use client";

type ContactField = {
    _id: string;
    type: number;
    mandatory: boolean;
    title: string;
    titleLan: {
        en?: string;
        es?: string;
    };
    dropDownData: string[];
    sequence: number;
};
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { toast } from "sonner";
import { ContactService } from "@/src/lib/services/contact";
import { resolveIpAddress } from "@/src/lib/utils/ip-resolver";
import { CustomerService } from "@/src/lib/services/customer.service";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { AuthService } from "@/src/lib/services/auth";
import { getCookie } from "cookies-next";

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
    const locale = useLocale();
    const t = useTranslations();
    const defaultCountry = (getCookie("C_code") as string || "pr").toLowerCase();
    const [formData, setFormData] = useState<ContactForm>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phoneCode: "+1",
        query: "",
    });
    const [countries, setCountries] = useState<CountryCurrency[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [contactDetails, setContactDetails] = useState<any[]>([]);
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const { user } = useProfile();
    const [fields, setFields] = useState<ContactField[]>([]);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

    useEffect(() => {
        const controller = new AbortController();

        CustomerService.getContactAddress({ signal: controller.signal })
            .then((res: any) => {
                const data = res?.data || [];
                setContactDetails(data);
            })
            .catch((err) => {
                console.error("Error fetching contact details:", err);
            });

        return () => controller.abort();
    }, []);
    const fetchingFieldsRef = useRef(false);

    const fetchContactFields = useCallback(() => {
        if (fetchingFieldsRef.current) {
            return;
        }

        fetchingFieldsRef.current = true;
        setLoading(true);

        ContactService.getContactFields()
            .then((payload) => {
                const items = (payload as any)?.data ?? [];

                const sorted = items.sort(
                    (a: ContactField, b: ContactField) => a.sequence - b.sequence
                );

                setFields(sorted);
            })
            .catch((err) => {
                try {
                    let errorMessage = "Unknown error";

                    if (err instanceof Error) {
                        errorMessage = err.message || err.toString();
                    } else if (err && typeof err === "object") {
                        if ("message" in err && typeof err.message === "string") {
                            errorMessage = err.message;

                            if ("status" in err && err.status) {
                                errorMessage = `[${err.status}] ${errorMessage}`;
                            }
                        } else {
                            try {
                                const serialized = JSON.stringify(err, null, 2);
                                errorMessage =
                                    serialized.length > 200
                                        ? serialized.substring(0, 200) + "..."
                                        : serialized;
                            } catch {
                                errorMessage = "Error object could not be serialized";
                            }
                        }
                    } else {
                        errorMessage = String(err);
                    }

                    console.warn("Error fetching contact fields:", errorMessage);
                } catch {
                    console.warn("Error fetching contact fields: Unknown error");
                }

                setFields([]);
            })
            .finally(() => {
                setLoading(false);
                fetchingFieldsRef.current = false;
            });
    }, []);
    useEffect(() => {
        fetchContactFields();
    }, [fetchContactFields]);

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

    const handleChange = (id: string, value: string) => {
        const sanitized = value.replace(/^\s+/, "");

        setFormValues((prev) => ({
            ...prev,
            [id]: sanitized,
        }));

        setFieldErrors((prev) => ({
            ...prev,
            [id]: "",
        }));
    };

    const handlePhoneCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, phoneCode: e.target.value }));
    };
    const validateDynamicFields = () => {
        const newErrors: Record<string, string> = {};

        fields.forEach((field) => {
            const value = (formValues[field._id] || "").trim();

            if (field.mandatory && !value) {
                newErrors[field._id] = t("fieldRequired");
                return;
            }

            if (field.type === 2 && value) {
                if (!/^\S+@\S+\.\S+$/.test(value)) {
                    newErrors[field._id] = t("emailInvalid");
                }
            }

            if (field.type === 1 && value) {
                if (value.length < 6) {
                    newErrors[field._id] = t("invalidMobile");
                }
            }
        });

        setFieldErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateDynamicFields()) return;

        try {
            setSubmitting(true);

            const ipAddress = await resolveIpAddress();

            const payload = {
                userIP: ipAddress,
                storeId: "0",
                form: fields.map((field) => ({
                    fieldId: field._id,
                    title: field.title,
                    value: formValues[field._id] || "",
                    titleLan: {
                        en: field.titleLan?.en || field.title,
                    },
                })),
            };

            await ContactService.submitContactForm(payload);

            toast.success(t("messageSent"));

            const reset: Record<string, string> = {};
            fields.forEach((f) => (reset[f._id] = ""));
            setFormValues(reset);

        } catch (err: any) {
            toast.error(err?.message || t("sendFailed"));
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <main>
            <Header />

            <div className="w-full bg-[#ededed]">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("contactUs") || "CONTACT US"}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed">
                        {t("contactUsDescription") || "Get in touch with us. We're here to help!"}
                    </p>
                </div>
                <div className="flex items-center justify-center mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 pb-2 lg:pt-16 lg:pb-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 w-full max-w-[400px] md:max-w-full">

                        {/* LEFT COLUMN */}
                        {/* Company Info Card */}
                        <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-6 lg:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <div className="w-1 h-8 bg-[#FECB02] rounded-full"></div>
                                {t("companyInformation") || "COMPANY INFORMATION"}
                            </h2>

                            <div className="space-y-8 lg:space-y-10">
                                {/* Address */}
                                <div className="flex items-start gap-3 sm:gap-4 group">
                                    <div className="w-12 h-12 rounded-full btn-primary-static flex items-center justify-center transition-all duration-300">
                                        <MapPin className="w-5 h-5 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {t("address") || "Address"}
                                        </h3>
                                        {contactDetails.map((item) => (
                                            <p key={item._id} className="text-gray-500 leading-relaxed text-sm">
                                                {item.address}<br />
                                                {item.title}<br />
                                                {item.city}, {item.zipCode}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-3 sm:gap-4 group">
                                    <div className="w-12 h-12 rounded-full btn-primary-static flex items-center justify-center transition-all duration-300">
                                        <Mail className="w-5 h-5 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {t("email") || "Email"}
                                        </h3>

                                        {contactDetails.map((item) => (
                                            <a
                                                key={item._id}
                                                href={`mailto:${item.email}`}
                                                className="text-gray-600 hover:text-[#FECB02] transition-colors font-medium text-sm"
                                            >
                                                {item.email}
                                            </a>
                                        ))}

                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-3 sm:gap-4 group">
                                    <div className="w-12 h-12 rounded-full btn-primary-static flex items-center justify-center transition-all duration-300">
                                        <Phone className="w-5 h-5 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {t("phoneNumber") || "Phone"}
                                        </h3>
                                        {contactDetails.map((item) => (
                                            <a
                                                key={item._id}
                                                href={`tel:${item.countryCode}${item.phone}`}
                                                className="text-gray-600 hover:text-[#FECB02] transition-colors font-medium text-sm"
                                            >
                                                {item.countryCode} {item.phone}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="flex items-center justify-center">
                            <div className="relative w-full max-w-md aspect-4/5 overflow-hidden rounded-3xl shadow-2xl">
                                <Image
                                    src={Contate_girl || contactUsBanner || "/images/contactUs/contactUsBanner.png"}
                                    alt="Contact Us"
                                    fill
                                    className="object-cover"

                                />
                            </div>
                        </div> */}
                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-8">
                            <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-6 lg:p-8">

                                <div className="mb-6 text-center">
                                    <h2 className="text-xl sm:text-2xl font-bold section_title">
                                        {t("sendMessage")}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {fields.map((field) => {
                                        const label =
                                            locale === "es"
                                                ? field.titleLan?.es || field.title
                                                : field.titleLan?.en || field.title;

                                        // TEXT INPUT (First / Last Name)
                                        if (field.type === 6) {
                                            return (
                                                <div key={field._id} className="space-y-2 md:col-span-1">
                                                    <Label required={field.mandatory} error={!!fieldErrors[field._id]}>
                                                        {label}
                                                    </Label>

                                                    <Input
                                                        placeholder={t("enterField", { field: label })}
                                                        value={formValues[field._id] || ""}
                                                        error={!!fieldErrors[field._id]}
                                                        onChange={(e) => handleChange(field._id, e.target.value)}
                                                    />

                                                    <ErrorMessage message={fieldErrors[field._id]} />
                                                </div>
                                            );
                                        }

                                        // EMAIL
                                        if (field.type === 2) {
                                            return (
                                                <div key={field._id} className="space-y-2 md:col-span-2">
                                                    <Label required={field.mandatory} error={!!fieldErrors[field._id]}>
                                                        {label}
                                                    </Label>

                                                    <Input
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        value={formValues[field._id] || ""}
                                                        error={!!fieldErrors[field._id]}
                                                        onKeyDown={(e) => {
                                                            if (e.key === " ") e.preventDefault();
                                                        }}
                                                        onChange={(e) => handleChange(field._id, e.target.value)}
                                                    />

                                                    <ErrorMessage message={fieldErrors[field._id]} />
                                                </div>
                                            );
                                        }

                                        // PHONE INPUT
                                        if (field.type === 1) {
                                            return (
                                                <div key={field._id} className="md:col-span-2 space-y-2">
                                                    <Label required={field.mandatory} error={!!fieldErrors[field._id]}>
                                                        {label}
                                                    </Label>
                                                    {countriesLoading || countries.length === 0 ? (
                                                        <div className="w-full h-[44px] rounded-lg border border-[#2f2f2f] px-4 flex items-center text-sm text-gray-400">
                                                            Loading...
                                                        </div>
                                                    ) : (
                                                        <PhoneInput
                                                            country={defaultCountry}
                                                            value={formValues[field._id] || ""}
                                                            onlyCountries={countries.map(c => c.countryCode.toLowerCase())}
                                                            onChange={(value) => handleChange(field._id, value)}
                                                            inputClass={`
            !bg-transparent !w-full !h-[44px] !text-sm !rounded-lg
            ${fieldErrors[field._id] ? "!border-red-500" : "!border-input"}
          `}
                                                        />)}

                                                    <ErrorMessage message={fieldErrors[field._id]} />
                                                </div>
                                            );
                                        }

                                        // TEXTAREA (Query)
                                        if (field.type === 5) {
                                            return (
                                                <div key={field._id} className="space-y-2 md:col-span-2">
                                                    <Label required={field.mandatory} error={!!fieldErrors[field._id]}>
                                                        {label}
                                                    </Label>

                                                    <textarea
                                                        placeholder={t("enterField", { field: label })}
                                                        value={formValues[field._id] || ""}
                                                        onChange={(e) => handleChange(field._id, e.target.value)}
                                                        className={`
            w-full rounded-lg px-4 py-3 text-sm
            ${fieldErrors[field._id]
                                                                ? "border border-red-500"
                                                                : "border focus:border-[#f3c200]"
                                                            }
          `}
                                                    />

                                                    <ErrorMessage message={fieldErrors[field._id]} />
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                    <button
                                        disabled={loading || submitting}
                                        className="md:col-span-2 w-full rounded-lg btn-primary py-3 font-semibold disabled:opacity-50 mt-3"
                                    >
                                        {(loading || submitting) ? t("sending") : t("send")}
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

