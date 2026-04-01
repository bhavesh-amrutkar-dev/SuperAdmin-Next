import airbridge from "airbridge-web-sdk-loader";

export const initAirbridge = () => {
  if (typeof window === "undefined") return;

  airbridge.init({
    app: process.env.NEXT_PUBLIC_AIRBRIDGE_APP_NAME!,
    webToken: process.env.NEXT_PUBLIC_AIRBRIDGE_WEB_TOKEN!,
  });
};