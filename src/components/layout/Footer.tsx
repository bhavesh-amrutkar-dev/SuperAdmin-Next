"use client";

import Link from "next/link";
import Image from "next/image";
import { APP_STORE_IMG, CDN_IMAGE, Facebook_icon, Instagram_icon, Linkedin_icon, Mastercard, PLAY_STORE_IMG, Twitter_icon, website_footer_logo } from "@/src/lib/config";

export default function Footer() {
    return (
        <footer className="bg-footerBg text-black">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Logo + Description */}
                    <div>
                        <Image
                            src={website_footer_logo}
                            alt="Footer Logo"
                            width={150}
                            height={45}
                            priority
                        />
                        <p className="mt-5 text-sm leading-relaxed text-black/70 max-w-sm">
                            There is always a chance to win.
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="uppercase text-sm font-semibold tracking-wide mb-5">
                            Company
                        </h4>
                        <ul className="space-y-3 text-sm text-black/70">
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Blogs
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Rules
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="uppercase text-sm font-semibold tracking-wide mb-5">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm text-black/70">
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Orders & Shipping
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Payment & Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-black transition">
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

                        <h4 className="mt-6 mb-4 text-sm font-semibold tracking-wide">
                            FOLLOW US ON SOCIAL MEDIA
                        </h4>

                        {/* Social Icons */}
                        <div className="flex items-center gap-5">
                            {[
                                { src: Facebook_icon, alt: "Facebook" },
                                { src: Instagram_icon, alt: "Instagram" },
                                { src: Twitter_icon, alt: "Twitter" },
                                { src: Linkedin_icon, alt: "LinkedIn" },
                            ].map((item) => (
                                <div
                                    key={item.alt}
                                    className="group cursor-pointer transition-transform duration-300 hover:scale-110"
                                >
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        width={26}
                                        height={26}
                                        className="social-icon opacity-70 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-footerDark">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center text-xs text-white/70 text-center">
                    <span>
                        Copyright © {new Date().getFullYear()} Don Rifa. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
