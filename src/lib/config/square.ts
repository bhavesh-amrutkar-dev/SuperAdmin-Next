export const getSquareConfig = () => {
  const isProd = process.env.NODE_ENV === "production";
console.log("process.env.NODE_ENV", process.env.NODE_ENV);

  return {
    appId: isProd
      ? process.env.NEXT_PUBLIC_SQUARE_APP_ID_PRODUCTION
      : process.env.NEXT_PUBLIC_SQUARE_APP_ID_SANDBOX,

    locationId: isProd
      ? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION
      : process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX,
  };
};