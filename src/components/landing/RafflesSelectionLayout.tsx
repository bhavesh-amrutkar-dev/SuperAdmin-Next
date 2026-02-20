
import dynamic from "next/dynamic";
import Link from "next/link";
import { RaffleSection } from "@/src/models/api/response/home";
import Skeleton from "../ui/skeleton";

const RaffleCard = dynamic(() => import("./RaffleCard"), {
  loading: () => (
    <div className="w-full aspect-3/4 rounded-2xl">
      <Skeleton className="w-full h-full rounded-2xl" />
    </div>
  ),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function RaffleSectionLayout({
  section,
  viewMoreLabel,
}: {
  section: RaffleSection;
  viewMoreLabel: string;
}) {
  const hasMore = section.items?.length > 5;
  const itemsToShow = hasMore
    ? section.items.slice(0, 5)
    : section.items ?? [];

  const isLoading = !section.items?.length;

  return (
    <section className="w-full py-10 md:py-14 xl:py-20">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide leading-tight text-gray-900">
            {section.title}
          </h2>

          {section.description && (
            <div
              className="mt-3 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.description }}
            />
          )}
        </div>

        {/* Cards */}
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          gap-3
          sm:gap-4
          md:gap-6
        ">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full aspect-3/4 rounded-2xl"
                />
              ))
            : itemsToShow.map((item) => {
                if (!item?.id) return null;

                const slug = item.name
                  ? slugify(item.name)
                  : item.id;

                const campaignId =
                  (item as any).campaignId || item.id;

                const childProductId =
                  (item as any).childProductId || "";

                const href = `/raffles/${slug}?pid=${campaignId}${
                  childProductId
                    ? `&cpid=${childProductId}`
                    : ""
                }`;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="block"
                    prefetch={false}
                  >
                    <div
                      className="
                        rounded-2xl
                        overflow-hidden
                        transition-transform
                        duration-200
                        md:hover:scale-[1.03]
                        md:hover:shadow-lg
                      "
                    >
                      <RaffleCard
                        item={item}
                        cellType={section.cellType}
                      />
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* View More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <Link
              href="/raffles"
              className="
                inline-flex items-center justify-center
                px-6 sm:px-8 py-3
                bg-gradient-to-r from-yellow-400 to-yellow-500
                text-black font-semibold text-sm sm:text-base
                rounded-full
                shadow-md
                transition-all duration-200
                md:hover:shadow-xl md:hover:scale-105
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
              "
            >
              {viewMoreLabel}
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
