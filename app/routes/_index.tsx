import { MyMap } from "~/modules/Map";
import type { Route } from "./+types/_index";
import { markerStylesheet } from "~/modules/Map";
import { Header } from "~/modules/header";
import { useState } from "react";
import { CategorySelector } from "~/modules/event/ui/category-selector";
import { useMediaQuery } from "~/shared/hooks/use-media-query";
import {
  MOBILE_BREAKPOINT,
  EventsDrawer,
  EventList,
} from "~/modules/events-list";
import type { Category } from "~/shared/model/Category";
import type { MapBounds } from "~/shared/model/Map";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: markerStylesheet },
];

export function meta() {
  return [
    { title: "EventApp" },
    { name: "description", content: "Welcome to EventApp!" },
  ];
}

type SelectedCategory = Category | null;

export default function Home() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory>(null);

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden">
      <Header />

      <main className="flex-1 min-h-0 overflow-hidden" aria-label="Events page">
        {!isMobile ? (
          <>
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <section className="h-full min-h-0 p-6 pt-4">
              <div className="grid h-full min-h-0 grid-cols-1 gap-6 md:grid-cols-2">
                <aside
                  className="min-h-0 overflow-y-auto rounded-xl bg-muted/25"
                  aria-label="Events list"
                >
                  <div className="p-4 sm:p-6">
                    <EventList
                      bounds={bounds}
                      selectedCategory={selectedCategory}
                    />
                  </div>
                </aside>

                <section
                  className="min-h-0 overflow-hidden rounded-xl"
                  aria-label="Events map"
                >
                  <div className="h-full">
                    <MyMap setBounds={setBounds} category={selectedCategory} />
                  </div>
                </section>
              </div>
            </section>
          </>
        ) : (
          <section
            className="flex h-full min-h-0 flex-col"
            aria-label="Mobile events view"
          >
            <div className="shrink-0 bg-white p-2 shadow-sm">
              <CategorySelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            <div className="min-h-0 flex-1 p-4 pb-24">
              <div className="h-full overflow-hidden rounded-xl shadow-lg">
                <MyMap setBounds={setBounds} category={selectedCategory} />
              </div>
            </div>

            <EventsDrawer bounds={bounds} selectedCategory={selectedCategory} />
          </section>
        )}
      </main>
    </div>
  );
}
