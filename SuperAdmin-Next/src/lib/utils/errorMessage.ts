export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
    const message = extractErrorMessage(error);

    return message || fallback;
}

function extractErrorMessage(error: unknown): string | undefined {
    if (!error) return undefined;

    if (typeof error === "string") {
        return parseMessage(error);
    }

    if (error instanceof Error) {
        return parseMessage(error.message);
    }

    if (typeof error === "object") {
        const maybeError = error as {
            message?: unknown;
            response?: { data?: unknown };
            data?: unknown;
        };

        const responseMessage = extractMessageFromData(maybeError.response?.data);
        if (responseMessage) return responseMessage;

        const dataMessage = extractMessageFromData(maybeError.data);
        if (dataMessage) return dataMessage;

        if (typeof maybeError.message === "string") {
            return parseMessage(maybeError.message);
        }
    }

    return undefined;
}

function extractMessageFromData(data: unknown): string | undefined {
    if (!data) return undefined;

    if (typeof data === "string") {
        return parseMessage(data);
    }

    if (typeof data === "object") {
        const payload = data as { message?: unknown; error?: unknown };
        const message = normalizeMessage(payload.message);
        if (message) return message;

        const error = normalizeMessage(payload.error);
        if (error) return error;
    }

    return undefined;
}

function normalizeMessage(value: unknown): string | undefined {
    if (typeof value === "string") {
        return parseMessage(value);
    }

    if (Array.isArray(value)) {
        const messages = value
            .map((item) => normalizeMessage(item))
            .filter(Boolean);

        return messages.length > 0 ? messages.join(", ") : undefined;
    }

    return undefined;
}

function parseMessage(message: string): string | undefined {
    const trimmed = message.trim();
    if (!trimmed || trimmed === "[object Object]") return undefined;

    try {
        const parsed = JSON.parse(trimmed);
        const parsedMessage = extractMessageFromData(parsed);

        return parsedMessage || trimmed;
    } catch {
        return trimmed;
    }
}
