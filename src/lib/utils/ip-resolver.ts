import { getMyIP } from "./getIp";

export const resolveIpAddress = async (): Promise<string> => {
  try {
    // First attempt: ipapi
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("ipapi failed");


    const data = await res.json();
    if (data?.ip) return data.ip;
    throw new Error("No IP in ipapi response");
  } catch (error) {
    console.warn("Primary IP fetch failed, trying fallback...");

    try {
      // Fallback: ipify (getMyIP / getIp)
      return await getMyIP();
    } catch (fallbackError) {
      console.warn("Fallback IP fetch failed:", fallbackError);
      return "123.201.110.196";
    }
  }
};