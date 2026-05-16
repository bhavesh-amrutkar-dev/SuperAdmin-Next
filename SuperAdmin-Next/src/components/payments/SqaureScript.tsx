import Script from "next/script";

export default function SquareScript() {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <Script
      src={
        isProd
          ? "https://web.squarecdn.com/v1/square.js"
          : "https://sandbox.web.squarecdn.com/v1/square.js"
      }
      strategy="afterInteractive"
    />
  );
}