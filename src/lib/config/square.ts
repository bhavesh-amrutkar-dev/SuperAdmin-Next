export const getSquareConfig = () => {
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

  // console.log("APP_ENV", process.env.APP_ENV);

  return {
    appId: isProd
      ? process.env.NEXT_PUBLIC_SQUARE_APP_ID_PRODUCTION
      : process.env.NEXT_PUBLIC_SQUARE_APP_ID_SANDBOX,

    locationId: isProd
      ? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION
      : process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX,

    cashAppPayScript: isProd
      ? "https://web.squarecdn.com/v1/square.js"
      : "https://sandbox.web.squarecdn.com/v1/square.js"
  };
};