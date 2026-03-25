import crypto from "crypto";

const SECRET = process.env.PAYMENT_TOKEN_SECRET!;

function getKey() {
    return crypto.createHash("sha256").update(SECRET).digest();
}

export function encryptPaymentToken(data: any) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        getKey(),
        iv
    );

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
}

export function decryptPaymentToken(token: string) {
    try {
        const parts = token.split(":");

        if (parts.length !== 2) {
            console.error("[decryptPaymentToken] Invalid token format", {
                token,
            });
            throw new Error("Invalid token format");
        }

        const [ivHex, encrypted] = parts;
        const iv = Buffer.from(ivHex, "hex");

        const key = getKey();

        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            key,
            iv
        );

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        const parsed = JSON.parse(decrypted);
        return parsed;

    } catch (error: any) {
        console.error("[decryptPaymentToken] Failed", {
            message: error?.message,
            stack: error?.stack,
            tokenPreview: token?.slice(0, 20) + "...",
        });

        throw error; 
    }
}