import { ENABLE_BRANCH_IO } from "../config"

export function createProductDeepLink(product: {
  id: string
  name: string
  description: string
  image: string
  fallbackUrl?: string
}) {
  return new Promise<string>(async (resolve) => {
    const BASE_URL =
      process.env.NODE_ENV === "production"
        ? "https://donrifa.com"
        : "https://stage.donrifa.com"

    const fallbackUrl = product.fallbackUrl || `${BASE_URL}/raffles/${product.id}`

    // if (ENABLE_BRANCH_IO) {
    //   try {
    //     console.log("Calling Branch API route from deeplink service...");
    //     const response = await fetch("/api/branch/url", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         campaign: "product_share",
    //         channel: "web",
    //         feature: "share",
    //         data: {
    //           $canonical_identifier: `product/${product.id}`,
    //           $og_title: product.name,
    //           $og_description: product.description,
    //           $og_image_url: product.image,
    //           $fallback_url: fallbackUrl,
    //           type: "product",
    //           id: product.id,
    //         },
    //       }),
    //     })

    //     const result = await response.json()
    //     console.log("Deeplink Service: API result:", result);
    //     if (result.url) {
    //       return resolve(result.url)
    //     }
    //   } catch (error) {
    //     console.warn("Branch API failed, using fallback URL:", error)
    //   }
    //   return resolve(fallbackUrl)
    // }

    // Existing fallback logic (if ENABLE_BRANCH_IO is false, but here we just return fallbackUrl as per plan to rely on API or direct fallback)
    // If the valid branch client SDK was preferred when false, we could keep it, but the request emphasized the API route.
    // For now, if disabled, we return fallbackUrl directly to keep it simple and consistent with "server-side or nothing".

    // However, looking at the original code, it used client-side SDK. If config is false, we should probably stick to the original implementation?
    // The user said: "if this ENABLE_BRANCH_IO false then use falback implementation that is ithe current implmentation"
    // The current implementation WAS the client-side SDK.
    // Let's keep the client-side logic as the "else" block.

    // if (!window.branch) {
    //   console.warn("Branch not loaded, using fallback URL")
    //   return resolve(fallbackUrl)
    // }
    if (window.branch) {
      console.log("Branch initiates");

    }
    window.branch.link(
      {
        feature: "share",
        channel: "web",
        campaign: "product_share",
        data: {
          $canonical_identifier: `product/${product.id}`,
          $og_title: product.name,
          $og_description: product.description,
          $og_image_url: product.image,
          $fallback_url: fallbackUrl,
          type: "product",
          id: product.id,
        },
      },
      (err: any, link: string) => {
        if (err) {
          console.warn("Branch failed, using fallback URL:", err)
          resolve(fallbackUrl)
        } else {
          resolve(link)
        }
      }
    )
  })
}
