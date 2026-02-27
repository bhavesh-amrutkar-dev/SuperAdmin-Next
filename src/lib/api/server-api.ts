import { cookies } from "next/headers";
import { API_PY_URL, DEFAULT_COUNTRY_CODE, DEFAULT_LANGUAGE } from "../config";
export async function getCommonServerHeaders() {
    const cookieStore = await cookies();

    const currencyCode = cookieStore.get("currencyCode")?.value || "USD";
    const currencySymbol = cookieStore.get("currencySymbol")?.value || "$";
    const language = cookieStore.get("NEXT_LOCALE")?.value || DEFAULT_LANGUAGE;
    const token = cookieStore.get("token")?.value;
    const country = cookieStore.get("C_code")?.value || DEFAULT_COUNTRY_CODE;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        language,
        currencycode: currencyCode,
        currencysymbol: btoa(currencySymbol),
        platform: "3",
        country,
    };

    if (token) {
        headers["Authorization"] = token;
    }

    return headers;
}

export async function serverFetch<T>(
    endpoint: string,
    options: RequestInit & { baseUrl?: string; timeout?: number } = {}
): Promise<{ data?: T; error?: { status?: number; message: string } }> {
    const headers = await getCommonServerHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    const baseUrl = options.baseUrl || API_PY_URL;
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...config,
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            return {
                error: { status: response.status, message: errorText || "Something went wrong" },
            };
        }

        const data = await response.json();
        return { data };
    } catch (err: any) {
        if (err.name === "AbortError") {
            return { error: { message: `Request timed out after ${timeout}ms` } };
        }
        return { error: { message: err.message || "Something went wrong." } };
    } finally {
        clearTimeout(id);
    }
}