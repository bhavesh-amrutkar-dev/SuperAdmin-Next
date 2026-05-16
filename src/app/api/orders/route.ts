import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") || "20";
    const skip = searchParams.get("skip") || "0";
    const status = searchParams.get("status") || "0";
    const storeType = searchParams.get("storeType") || "0";
    const search = searchParams.get("search");
    const orderTime = searchParams.get("orderTime");

    const query = new URLSearchParams({
      limit,
      skip,
      status,
      storeType,
    });

    if (search) query.append("search", search);
    if (orderTime) query.append("orderTime", orderTime);

    const { data, error } = await serverFetch(
      `/orders?${query.toString()}`,
      {
        method: "GET",
        baseUrl: API_NY_URL,
      }
    );

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}