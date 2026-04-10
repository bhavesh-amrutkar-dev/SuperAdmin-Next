// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import BranchProvider from "../components/BranchProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DonRifa",
    template: "%s | DonRifa",
  },
  description: "There is always a chance to win.",
};

import { CountryService } from "../lib/services/country";
import { cookies } from "next/headers";
import { API_NY_URL, DEFAULT_COUNTRY_CODE, DEFAULT_LANGUAGE } from "../lib/config";
import AirbridgeProvider from "./airbridgeProvider";
import GoogleAnalyticsTracker from "../components/GoogleAnalyticsTracker";
import MetaPixelTracker from "../components/metaPixel";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Server-side fetch

  let countries: any = [];

  try {
    const cookieStore = await cookies();

    const language =
      cookieStore.get("NEXT_LOCALE")?.value || DEFAULT_LANGUAGE;
    const country =
      cookieStore.get("C_code")?.value || DEFAULT_COUNTRY_CODE;
    const response = await fetch(`${API_NY_URL}/country`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        currencycode: "USD",
        currencysymbol: Buffer.from("$").toString("base64"),
        language,
        country,
        platform: "3",
      },
      cache: "no-store", // always fresh
    });

    if (!response.ok) {
      throw new Error(`Country API failed with status ${response.status}`);
    }

    const json = await response.json();
    countries = json?.data ?? [];

  } catch (error: any) {
    console.warn("❌ Failed to fetch countries on server");
    console.warn("Message:", error.message);
  }

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#ededed]`}
      >
        {/* <Script
          src="https://payments.athmovil.com/api/js/athmovil_base.js"
          strategy="beforeInteractive"
        /> */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YRFMY9GL2H"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-YRFMY9GL2H', {
      page_path: window.location.pathname,
    });
  `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', '1468573554204803');
    fbq('track', 'PageView');
  `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1468573554204803&ev=PageView&noscript=1"
          />
        </noscript>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders countries={countries}>
            <AirbridgeProvider>
              <GoogleAnalyticsTracker />
              <MetaPixelTracker />
              {children}
            </AirbridgeProvider>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
