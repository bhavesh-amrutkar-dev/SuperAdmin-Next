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
// export function decryptPaymentToken(token: string) {
//   const start = Date.now();

//   try {
//     if (!token) {
//       console.error("[PaymentToken] Missing token");
//       throw new Error("Token missing");
//     }

//     if (!token.includes(":")) {
//       console.error("[PaymentToken] Invalid token format (no colon)", {
//         tokenPreview: token.slice(0, 20),
//         length: token.length,
//       });
//       throw new Error("Invalid token format");
//     }

//     const [ivHex, encrypted] = token.split(":");

//     if (!ivHex || !encrypted) {
//       console.error("[PaymentToken] Token split failed", {
//         parts: token.split(":").length,
//       });
//       throw new Error("Malformed token");
//     }

//     if (ivHex.length !== 32) {
//       console.error("[PaymentToken] Invalid IV length", {
//         ivLength: ivHex.length,
//       });
//     }

//     const iv = Buffer.from(ivHex, "hex");

//     console.debug("[PaymentToken] Decryption attempt", {
//       ivLength: iv.length,
//       encryptedLength: encrypted.length,
//       hasSpaces: token.includes(" "),
//       hasPlus: token.includes("+"),
//     });

//     const decipher = crypto.createDecipheriv(
//       "aes-256-cbc",
//       getKey(),
//       iv
//     );

//     let decrypted = decipher.update(encrypted, "hex", "utf8");
//     decrypted += decipher.final("utf8");

//     const parsed = JSON.parse(decrypted);

//     console.debug("[PaymentToken] Decryption success", {
//       durationMs: Date.now() - start,
//       orderId: parsed?.orderId,
//       hasExp: !!parsed?.exp,
//     });

//     return parsed;

//   } catch (err: any) {
//     console.error("[PaymentToken] Decryption failed", {
//       error: err?.message,
//       stack: err?.stack,
//       tokenLength: token?.length,
//       tokenStart: token?.slice(0, 10),
//       tokenEnd: token?.slice(-10),
//       containsColon: token?.includes(":"),
//       parts: token?.split(":")?.length,
//       env: process.env.NODE_ENV,
//     });

//     throw new Error("Invalid or corrupted payment token");
//   }
// }

export function decryptPaymentToken(token: string) {
  try {
    console.log("[decryptPaymentToken] Incoming token", {
      length: token?.length,
      preview: token?.slice(0, 15) + "...",
    });

    const parts = token.split(":");

    if (parts.length !== 2) {
      console.error("[decryptPaymentToken] Invalid token format", {
        token,
      });
      throw new Error("Invalid token format");
    }

    const [ivHex, encrypted] = parts;

    console.log("[decryptPaymentToken] Parsed token", {
      ivHexLength: ivHex?.length,
      encryptedLength: encrypted?.length,
    });

    const iv = Buffer.from(ivHex, "hex");

    console.log("[decryptPaymentToken] IV buffer", {
      ivLength: iv.length,
    });

    const key = getKey();

    console.log("[decryptPaymentToken] Key info", {
      keyLength: key.length,
    });

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      iv
    );

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    console.log("[decryptPaymentToken] Decrypted string", {
      preview: decrypted?.slice(0, 50),
    });

    const parsed = JSON.parse(decrypted);

    console.log("[decryptPaymentToken] Parsed JSON", parsed);

    return parsed;

  } catch (error: any) {
    console.error("[decryptPaymentToken] Failed", {
      message: error?.message,
      stack: error?.stack,
      tokenPreview: token?.slice(0, 20) + "...",
    });

    throw error; // rethrow so outer catch still works
  }
}