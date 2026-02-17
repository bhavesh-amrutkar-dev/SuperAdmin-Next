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

export async function serverFetch<T>(endpoint: string, options: RequestInit & { baseUrl?: string; timeout?: number } = {}): Promise<T> {
    const headers = await getCommonServerHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    const baseUrl = options.baseUrl || API_PY_URL;
    const timeout = options.timeout || 15000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...config,
            signal: controller.signal,
        });

        if (!response.ok) {
            console.warn(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    } finally {
        clearTimeout(id);
    }
}
