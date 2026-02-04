import { publicIp } from "public-ip";

export const LocationService = {
  /** Get user IP (server-side only) */
  async getMyIP(): Promise<string> {
    return publicIp();
  },
};
