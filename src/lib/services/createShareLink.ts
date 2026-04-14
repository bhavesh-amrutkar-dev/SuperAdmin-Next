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

    // ✅ 1. Log incoming request
    // console.log("🔹 Incoming Request:", JSON.stringify(body, null, 2));

    // ✅ 2. Build payload separately (important for debugging)
    const airbridgePayload = {
      channel: "my-channel",

      campaignParams: {
        campaign: "raffle_share",
        ad_group: "web",
        ad_creative: "share_button",
      },

      isReengagement: "ON-TRUE",

      deeplinkOption: {
        showAlertForInitialDeeplinkingIssue: true,
      },

      fallbackPaths: {
        option: {
          iosCustomProductPageId: "5ae82ffe-1f08-428d-b352-ac1c3a22aa1e",
          googlePlayCustomStoreListing: "custom-store-listing",
        },
      },

      deepLink: {
        path: `/raffles/${slug}`,
      },

      fallback: {
        url: `https://donrifa.com/raffles/${slug}`,
      },

      params: {
        product_id: productId,
        pid,
        cpid,
      },

      ogTag: {
        title: ogTitle || "DonRifa",
        description: ogDescription || "Play and win on DonRifa!",
        imageUrl:
          ogImage ||
          "https://static.airbridge.io/images/2021_airbridge_og_tag.png",
      },
    };

    // ✅ 3. Log payload sent to Airbridge
    // console.log("🚀 Airbridge Payload:", JSON.stringify(airbridgePayload, null, 2));

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

    // ✅ 4. Log full response
    // console.log(
    //   "✅ Airbridge Response:",
    //   JSON.stringify(response.data, null, 2)
    // );

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