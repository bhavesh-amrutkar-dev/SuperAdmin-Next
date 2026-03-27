import { cookies } from "next/headers";
import { API_PY_URL, DEFAULT_COUNTRY_CODE, DEFAULT_LANGUAGE, DEVICE_TYPE_WEB } from "../config";
import { getDeviceInfo } from "../utils/device";

/* ---------------- COMMON HEADERS ---------------- */
export async function getCommonServerHeaders(overrideAuthToken?: string) {
    const cookieStore = await cookies();

    const currencyCode = cookieStore.get("currencyCode")?.value || "USD";
    const currencySymbol = cookieStore.get("currencySymbol")?.value || "$";
    const language = cookieStore.get("NEXT_LOCALE")?.value || DEFAULT_LANGUAGE;
    const country = cookieStore.get("C_code")?.value || DEFAULT_COUNTRY_CODE;

    const cookieToken = cookieStore.get("token")?.value;
    const finalToken = overrideAuthToken || cookieToken;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        language,
        currencycode: currencyCode,
        currencysymbol: Buffer.from(currencySymbol).toString("base64"),
        platform: "3",
        country,
    };

    if (finalToken) {
        headers["Authorization"] = finalToken;
    }

    return headers;
}

/* ---------------- SERVER FETCH ---------------- */
export async function serverFetch<T>(
    endpoint: string,
    options: RequestInit & {
        baseUrl?: string;
        timeout?: number;
        overrideAuthToken?: string;
        _retry?: boolean;
    } = {}
): Promise<{ data?: T; error?: { status?: number; message: string } }> {
    const baseUrl = options.baseUrl || API_PY_URL;
    const timeout = options.timeout || 60000;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const headers = await getCommonServerHeaders(options.overrideAuthToken);

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
            signal: controller.signal,
        });

        /* ---------------- 🔥 401 HANDLING ---------------- */
        if (
            response.status === 401 &&
            !options._retry &&
            !endpoint.includes("/guest/signIn")
        ) {
            try {
                const cookieStore = await cookies();

                // clear token
                cookieStore.set("token", "", { path: "/", maxAge: 0 });
                const device = getDeviceInfo();
                // call guest API
                const guestRes = await fetch(`${baseUrl}/guest/signIn`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        deviceId: "web_app_id" + Date.now(),
                        deviceType: DEVICE_TYPE_WEB,
                        deviceTime: new Date().toISOString(),
                        ...device
                    }),
                });

                const guestData = await guestRes.json();
                const newToken = guestData?.data?.token?.accessToken;
                const sid = guestData?.data?.sid;

                if (newToken) {
                    cookieStore.set("token", newToken, {
                        path: "/",
                        maxAge: 60 * 60 * 24 * 7,
                    });
                }

                if (sid) {
                    cookieStore.set("sid", sid, {
                        path: "/",
                        maxAge: 60 * 60 * 24 * 7,
                    });
                }

                if (newToken) {
                    return serverFetch(endpoint, {
                        ...options,
                        _retry: true,
                        overrideAuthToken: newToken,
                    });
                }

                return {
                    error: { status: 401, message: "Session expired" },
                };
            } catch {
                return {
                    error: { status: 401, message: "Session expired" },
                };
            }
        }

        /* ---------------- ❌ NORMAL ERROR ---------------- */
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            return {
                error: {
                    status: response.status,
                    message: errorText || "Something went wrong",
                },
            };
        }

        /* ---------------- ✅ SUCCESS ---------------- */
        const data = await response.json();
        return { data };

    } catch (err: any) {
        if (err.name === "AbortError") {
            return {
                error: { message: `Request timed out after ${timeout}ms` },
            };
        }

        return {
            error: { message: err.message || "Something went wrong." },
        };

    } finally {
        clearTimeout(id);
    }
}