
import { getMyIP } from "./getIp";

export const resolveIpAddress = async (): Promise<string> => {
  try {
    // Force IPv4 response
    const res = await fetch("https://api4.ipify.org?format=json");

    if (!res.ok) {
      throw new Error("IPv4 fetch failed");
    }

    const data = await res.json();

    if (data?.ip) {
      return data.ip;
    }

    throw new Error("No IP in response");
  } catch (error) {
    console.warn("Primary IP fetch failed, trying fallback...");

    try {
      return await getMyIP();
    } catch (fallbackError) {
      console.warn("Fallback IP fetch failed:", fallbackError);

      return "123.201.110.196";
    }
  }
};