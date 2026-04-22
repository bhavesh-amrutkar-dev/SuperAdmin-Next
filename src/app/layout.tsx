// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";

import { cookies } from "next/headers";
import {
  API_NY_URL,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LANGUAGE,
} from "../lib/config";

import AirbridgeProvider from "./airbridgeProvider";
import MetaPixelTracker from "../components/metaPixel";
import FirebaseInit from "./FirebaseInit";
import FirebasePageTracker from "../components/FirebasePageTracker";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

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
      cache: "no-store",
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
      <head>
        {/* Meta Pixel - load early */}
        <Script id="meta-pixel" strategy="beforeInteractive">
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

        {/* Google Analytics */}
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
      </head>

      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#ededed]`}
      >
        {/* Meta Pixel fallback */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <img height="1" width="1" style="display:none"
              src="https://www.facebook.com/tr?id=1468573554204803&ev=PageView&noscript=1"/>
            `,
          }}
        />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders countries={countries}>
            <AirbridgeProvider>
              <FirebaseInit />
              <FirebasePageTracker />
              <MetaPixelTracker />
              {children}
            </AirbridgeProvider>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}