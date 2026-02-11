export function createProductDeepLink(product: {
  id: string
  name: string
  description: string
  image: string
}) {
  return new Promise<string>((resolve, reject) => {
    if (!window.branch) return reject('Branch not loaded')

    const BASE_URL =
      process.env.NODE_ENV === 'production'
        ? 'https://donrifa.com'
        : 'https://stage.donrifa.com'

    window.branch.link(
      {
        feature: 'share',
        channel: 'web',
        campaign: 'product_share',
        data: {
          $canonical_identifier: `product/${product.id}`,
          $og_title: product.name,
          $og_description: product.description,
          $og_image_url: product.image,
          $fallback_url: `${BASE_URL}/product/${product.id}`,
          type: 'product',
          id: product.id
        }
      },
      (err: any, link: string) => {
        if (err) reject(err)
        else resolve(link)
      }
    )
  })
}
