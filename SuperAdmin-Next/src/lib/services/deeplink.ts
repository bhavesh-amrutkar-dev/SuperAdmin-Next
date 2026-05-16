import { ENABLE_BRANCH_IO } from "../config"

declare global {
  interface Window {
    branch: any
  }
}

export function createProductDeepLink(product: {
  id: string
  name: string
  description: string
  image: string
  fallbackUrl?: string
}): Promise<string> {
  return new Promise((resolve) => {
    const BASE_URL =
      process.env.NODE_ENV === "production"
        ? "https://donrifa.com"
        : "https://stage.donrifa.com"

    const fallbackUrl =
      product.fallbackUrl || `${BASE_URL}/raffles/${product.id}`

    if (!ENABLE_BRANCH_IO) {
      return resolve(fallbackUrl)
    }

    if (typeof window === "undefined" || !window.branch) {
      console.warn("Branch not loaded, using fallback URL")
      return resolve(fallbackUrl)
    }

    const linkData = {
      campaign: "product_share",
      channel: "web",
      feature: "share",
      stage: "product",
      tags: ["product"],
      data: {
        type: "product",
        id: product.id,
        $canonical_identifier: `product/${product.id}`,
        $og_title: product.name,
        $og_description: product.description,
        $og_image_url: product.image,
        $fallback_url: fallbackUrl,
      },
    }

    window.branch.link(linkData, function (err: any, link: string) {
      if (err) {
        console.warn("Branch link failed:", err)
        resolve(fallbackUrl)
      } else {
        resolve(link)
      }
    })
  })
}
