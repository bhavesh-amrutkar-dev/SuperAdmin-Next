"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  CDN_IMAGE,
  Facebook_icon_new,
  Instagram_icon_new,
  Linkedin_icon_new,
  Twitter_icon_new,
  Youtube_icon_new,
  Mastercard,
  website_logo,
} from "@/src/lib/config";

export default function Footer() {
  const t = useTranslations();

  const SOCIAL_MEDIA_LINKS = [
    { name: "Facebook", href: "https://www.facebook.com/donrifallc/", icon: Facebook_icon_new },
    { name: "Instagram", href: "https://www.instagram.com/donrifallc", icon: Instagram_icon_new },
    { name: "Twitter", href: "https://x.com/donrifallc/", icon: Twitter_icon_new },
    { name: "LinkedIn", href: "https://www.linkedin.com/donrifallc", icon: Linkedin_icon_new },
    { name: "YouTube", href: "https://www.youtube.com/channel/UCeeQ4yfMdHvK_ViM_5oRvow/videos", icon: Youtube_icon_new },
  ];

  return (
    <footer className="bg-[#2f2f2f] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo + Description */}
          <div className="text-center sm:text-left">
            <Image
              src={website_logo}
              alt="Footer Logo"
              width={180}
              height={40}
              className="mx-auto sm:mx-0"
              priority
            />

            <p className="mt-6 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
              <b>Don Rifa</b> {t("footerDescription")}
            </p>

            <p className="mt-4 font-semibold">
              {t("footerTagline")}
            </p>
          </div>

          {/* Company */}
          <div className="text-center sm:text-left">
            <h4 className="uppercase text-base font-semibold mb-5 text-[#f3c200]">
              {t("companyTitle")}
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["/about", t("about")],
                ["/blog", t("blogs")],
                ["/contact", t("contact")],
                ["/rules", t("rules")],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#f3c200] transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="uppercase text-base font-semibold mb-5 text-[#f3c200]">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["/orders-shipping", t("ordersShipping")],
                ["/payment-pricing", t("paymentPricing")],
                ["/returns-refunds", t("returnsRefunds")],
                ["/faqs", t("faqs")],
                ["/privacy-policy", t("privacyPolicy")],
                ["/terms-conditions", t("termsConditions")],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#f3c200] transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments + Social */}
          <div className="text-center sm:text-left">
            {/* Payments */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {[
                CDN_IMAGE + "card-4.svg",
                CDN_IMAGE + "card-6.svg",
                CDN_IMAGE + "card-7.svg",
                CDN_IMAGE + "card-8.svg",
                Mastercard,
              ].map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt="Payment method"
                  className="h-6 sm:h-7 opacity-80 hover:opacity-100 transition"
                />
              ))}
            </div>

            {/* Social */}
            <h4 className="mt-8 mb-4 text-sm font-semibold text-[#f3c200]">
              {t("followUs")}
            </h4>

            <div className="flex justify-center sm:justify-start gap-4 flex-wrap">
              {SOCIAL_MEDIA_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  className="transition transform hover:scale-110"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
                    <Image src={item.icon} alt={item.name} width={24} height={24} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-white/70 text-center">
          © {new Date().getFullYear()} Don Rifa. {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
