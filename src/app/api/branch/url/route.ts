
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { campaign, channel, feature, data } = body;



        const branchKey = process.env.NEXT_PUBLIC_BRANCH_KEY;
        const keyType = "Public Key";


        // console.log("Branch API Route called");
        // console.log(`Using ${keyType}:`, branchKey ? (branchKey.substring(0, 10) + "...") : "None");
        // console.log("Request Body:", JSON.stringify(body, null, 2));

        const branchPayload = {
            app_id: process.env.NEXT_BRANCH_APP_ID,
            branch_key: branchKey,
            branch_secret: process.env.BRANCH_SECRET_KEY,
            campaign,
            channel,
            feature: feature || "sharing",
            data,
        };

        // console.log("Sending payload to Branch:", JSON.stringify({
        //     ...branchPayload,
        // }));

        const response = await fetch("https://api2.branch.io/v1/url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(branchPayload),
        });

        const result = await response.json();
        // console.log("Deeplink Service: API result:", result);
        // console.log("Branch API Response:", JSON.stringify(result, null, 2));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating Branch link:", error);
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }
}
