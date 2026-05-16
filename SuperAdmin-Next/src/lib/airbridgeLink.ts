// lib/airbridgeLink.ts

export const createAirbridgeLink = ({
  slug,
  productId,
  pid,
  cpid,
}: {
  slug: string;
  productId: string;
  pid?: string;
  cpid?: string;
}) => {
  const base = "https://go.donrifa.com/tundra"; 

  const url = new URL(base);

  // Core tracking
  url.searchParams.append("product_id", productId);
  url.searchParams.append("utm_source", "share");
  url.searchParams.append("utm_medium", "app");
  url.searchParams.append("utm_campaign", "product_share");

  // Deep link routing (CRITICAL)
  url.searchParams.append("deeplink_path", `/raffles/${slug}`);

  // Business params
  if (pid) url.searchParams.append("pid", pid);
  if (cpid) url.searchParams.append("cpid", cpid);

  return url.toString();
};