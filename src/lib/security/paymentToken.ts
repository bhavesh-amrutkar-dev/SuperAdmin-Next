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
    const [ivHex, encrypted] = token.split(":");

    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        getKey(),
        iv
    );

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
}