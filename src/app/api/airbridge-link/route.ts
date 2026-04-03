import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      slug,
      productId,
      pid,
      cpid,
      ogTitle,
      ogDescription,
      ogImage,
    } = body;
    const getBaseUrl = () => {
      const env = process.env.NEXT_PUBLIC_APP_ENV;

      switch (env) {
        case "stage":
          return "https://stage.donrifa.com";
        case "production":
        default:
          return "https://donrifa.com";
      }
    };
    const baseUrl = getBaseUrl();

    const fallbackUrl = `${baseUrl}/open?donrifa_type=raffle&donrifa_id=${pid}&donrifa_parent_id=${cpid}`;
    const airbridgePayload = {
      channel: "donrifa",

      campaignParams: {
        campaign: `product_${cpid}`,
      },

      isReengagement: "ON-TRUE",

      // ✅ THIS IS THE MOST IMPORTANT FIELD
      deeplinkUrl: `donrifa://open?donrifa_type=raffle&donrifa_id=${pid}&donrifa_parent_id=${cpid}`,

      // ✅ THIS CONTROLS YOUR WEB URL (/open)

      fallbackPaths: {
        desktop: fallbackUrl,
        ios: fallbackUrl,
        android: fallbackUrl,
      },

      ogTag: {
        title: ogTitle || "DonRifa",
        // description: ogDescription || "Play and win on DonRifa!",
        imageUrl:
          ogImage ||
          "https://static.airbridge.io/images/2021_airbridge_og_tag.png",
      },
    };


    const response = await axios.post(
      "https://api.airbridge.io/v1/tracking-links",
      airbridgePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRBRIDGE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );


    return NextResponse.json({
      url: response.data.data.trackingLink.shortUrl,
    });

  } catch (error: any) {
    // ✅ 5. Better error logging
    console.error("❌ Airbridge API error:");
    console.error(
      JSON.stringify(error?.response?.data || error, null, 2)
    );

    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}