export function normalizeAthMovilNumber(value?: string | null) {
    const digits = (value || "").replace(/\D/g, "");

    const normalized = digits.length > 10
        ? digits.slice(-10)
        : digits;

    console.log("📱 normalizeAthMovilNumber:", {
        input: value,
        digits,
        normalized,
    });

    return normalized;
}

export function formatTimer(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function handleAthMovilApiResponse(response: unknown) {
    if (!response || typeof response !== "object") {
        throw new Error("Invalid response: expected an object");
    }

    const payload = response as {
        status?: string;
        message?: string;
        errorcode?: string;
        data?: { validUser?: unknown };
    };

    if (payload.status === "error") {
        const message = payload.message || "Unknown API error";
        const code = payload.errorcode || "UNKNOWN";
        throw new Error(`API Error [${code}]: ${message}`);
    }

    if (payload.status !== "success") {
        throw new Error(`Unexpected status: "${payload.status}"`);
    }

    if (
        !payload.data ||
        typeof payload.data !== "object" ||
        typeof payload.data.validUser !== "boolean"
    ) {
        throw new Error("Invalid response structure: missing validUser field");
    }

    if (!payload.data.validUser) {
        throw new Error("This number is not registered with ATH Móvil. Please enter a valid registered number.");
    }

    return true;
}

export function hasStoredAthMovilNumber(response: unknown) {
    const payload = response && typeof response === "object" && "data" in response
        ? (response as { data?: unknown }).data
        : response;

    if (typeof payload === "boolean") return payload;

    if (!payload || typeof payload !== "object") return false;

    const data = payload as Record<string, unknown>;
    const flags = [
        data.exists,
        data.exist,
        data.isExist,
        data.isExists,
        data.isExisting,
        data.found,
        data.isFound,
        data.athMovilNumberExists,
        data.athmovilNumberExists,
        data.hasAthMovilNumber,
    ];

    return flags.some(isTruthyFlag);
}

function isTruthyFlag(value: unknown) {
    if (value === true || value === 1) return true;
    if (typeof value === "string") {
        return ["true", "1", "yes"].includes(value.toLowerCase());
    }

    return false;
}

export function formatAthMovilNumber(
    number: string,
    countryCode?: string
) {
    const digits = normalizeAthMovilNumber(number);
    const code = countryCode || "1";

    return `+${code}${digits}`;
}