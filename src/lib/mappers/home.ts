import { BannerImage, HomeBanner, HomeSection } from "@/src/models/api/response/home";

export function mapBanners(
  banners: BannerImage[],
  locale: string
): HomeBanner[] {
  return banners.map((banner) => ({
    imageWeb: banner.image_web,
    imageMobile: banner.image_mobile,
    title:
      banner.data?.[0]?.name?.[locale] ||
      banner.data?.[0]?.name?.en ||
      "",
    categories: banner.data.map((cat) => ({
      id: cat.id,
      label: cat.name[locale] || cat.name.en,
    })),
  }));
}


export interface MappedContentSection {
  title: string;
  description: string;
  images: string[];
  buttonText?: string;
}

export function mapContentSection(section: HomeSection): MappedContentSection {
  return {
    title: section.title || "",
    description: section.description || "",
    images: section.banner_image?.map((img) => img.image_web || "") || [],
    buttonText: section.buttonText || "",
  };
}