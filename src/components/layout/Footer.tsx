"use client";

import Link from "next/link";
import Image from "next/image";
import { APP_STORE_IMG, CDN_IMAGE, Facebook_icon_new, Instagram_icon_new, Linkedin_icon_new, Twitter_icon_new, Youtube_icon_new, Mastercard, PLAY_STORE_IMG, Twitter_icon, website_logo } from "@/src/lib/config";

export default function Footer() {
    return (
        <footer className="bg-[#2f2f2f] text-black">

            {/* Main Footer */}
            <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Logo + Description */}
                    <div>
                        <Image
                            src={website_logo}
                            alt="Footer Logo"
                            width={200}
                            height={45}
                            priority
                        />
                        <p className="mt-6 text-sm leading-relaxed text-white max-w-sm">
                            <b>Don Rifa</b> is an innovative digital platform that lets you enter raffles for exclusive prizes like cars, apartments, luxury watches, and more — all from your phone or web. 100% safe, transparent, and easy to use.
                        </p>
                        <br />
                        <p className="text-white">
                            <b>There’s always a chance to win!</b>
                        </p>
                    </div>

                    {/* Company */}
                    <div className="lg:ps-[60px] xl:ps-[100px]">
                        <h4 className="uppercase text-base font-semibold tracking-wide mb-5 !text-[#f3c200]">
                            DonRifa
                        </h4>
                        <ul className="space-y-3 text-sm ">
                            <li>
                                <Link href="/about" className="text-white hover:text-[#f3c200] transition">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-white hover:text-[#f3c200] transition">
                                    Blogs
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-white hover:text-[#f3c200] transition">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/rules" className="text-white hover:text-[#f3c200] transition">
                                    Rules
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="uppercase text-base font-semibold tracking-wide mb-5 !text-[#f3c200]">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li>
                                <Link href="/orders-shipping" className="text-white hover:text-[#f3c200] transition">
                                    Orders & Shipping
                                </Link>
                            </li>
                            <li>
                                <Link href="/payment-pricing" className="text-white hover:text-[#f3c200] transition">
                                    Payment & Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns-refunds" className="text-white hover:text-[#f3c200] transition">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link href="/faqs" className="text-white hover:text-[#f3c200] transition">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-white hover:text-[#f3c200] transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-conditions" className="text-white hover:text-[#f3c200] transition">
                                    Terms & Condition
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {/* Payments + Social */}
                    <div>
                        {/* Payment Icons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
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
                                    loading="lazy"
                                    className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition"
                                />
                            ))}
                        </div>

                        <h4 className="mt-8 mb-4 text-sm font-semibold tracking-wide text-[#f3c200]">
                            FOLLOW US ON SOCIAL MEDIA
                        </h4>

                        {/* Social Icons */}
                        <div className="flex items-center gap-5 flex-wrap">
                            {[
                                { src: Facebook_icon_new, alt: "Facebook" },
                                { src: Instagram_icon_new, alt: "Instagram" },
                                { src: Twitter_icon_new, alt: "Twitter" },
                                { src: Linkedin_icon_new, alt: "LinkedIn" },
                                { src: Youtube_icon_new, alt: "YouTube" },
                            ].map((item) => (
                                <div
                                    key={item.alt}
                                    className="group cursor-pointer transition-transform duration-300 hover:scale-110 w-10 h-10 flex items-center justify-center rounded-full bg-white !shadow-[0px_0px_0px_2px_#ffffff5c]"
                                >
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        width={26}
                                        height={26}
                                        className="social-icon transition-opacity duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-footerDark border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center text-xs text-white/70 font-medium text-center">
                    <span>
                        Copyright © {new Date().getFullYear()} Don Rifa. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
