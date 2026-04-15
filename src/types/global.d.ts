export {};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void; // also fix Meta Pixel typing
  }
}