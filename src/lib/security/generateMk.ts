// lib/security/generateMk.ts
import crypto from "crypto";

export const generateMk = (
  countryCode: string,
  mobile: string
): string => {
  const secretKey = process.env.NEXT_PUBLIC_WEB_AUTH_KEY;

  if (!secretKey) {
    throw new Error("Auth key not found in environment variables");
  }

  if (!countryCode || !mobile) {
    throw new Error("Country code and mobile number are required");
  }

  const value = `${countryCode}${mobile}${secretKey}`;

  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
};