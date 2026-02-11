export function createProductDeepLink(product: {
  id: string
  name: string
  description: string
  image: string
}) {
  return new Promise<string>((resolve) => {
    const BASE_URL =
      process.env.NODE_ENV === "production"
        ? "https://donrifa.com"
        : "https://stage.donrifa.com"

    const fallbackUrl = `${BASE_URL}/reffles/${product.id}`

    // If branch not loaded → fallback immediately
    if (!window.branch) {
      console.warn("Branch not loaded, using fallback URL")
      return resolve(fallbackUrl)
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
