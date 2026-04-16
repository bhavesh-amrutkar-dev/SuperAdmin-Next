import airbridge from "airbridge-web-sdk-loader";
import { trackFirebaseEvent } from "./firebase";

export const trackEvent = (eventName: string, params?: any) => {
  // Firebase (GA4)
  trackFirebaseEvent(eventName, params);

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
  // ✅ Airbridge
  if (typeof window !== "undefined") {
    try {
      airbridge.events.send(eventName, params);
    } catch (err) {
      console.warn("Airbridge event failed", err);
    }
  }
};