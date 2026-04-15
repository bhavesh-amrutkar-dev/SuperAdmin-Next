import { trackFirebaseEvent } from "./firebase";

export const trackEvent = (eventName: string, params?: any) => {
  // Firebase (GA4)
  trackFirebaseEvent(eventName, params);

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
};