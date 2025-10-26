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
    <>
      <Header />

      {/* Desktop Layout: одновременно список и карта */}
      <div className="hidden md:flex relative w-full h-[calc(100vh-4rem)] bg-gray-50">
        <div className="w-1/2 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                События рядом с вами
              </h2>
              <CategorySelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            <EventList bounds={bounds} selectedCategory={selectedCategory} />
          </div>
        </div>
        <div className="w-1/2 pr-6 py-6">
          <div className="h-full rounded-xl overflow-hidden shadow-lg">
            <MyMap setBounds={setBounds} category={selectedCategory} />
          </div>
        </div>
      </div>

      {/* Mobile Layout: карта на весь экран + drawer снизу */}
      {isMobile && (
        <div className="w-full h-[calc(100vh-4rem)] flex flex-col flex-1">
          {/* Category Selector */}
          <div className="bg-white rounded-lg shadow-lg p-2">
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Map */}
          <div className="w-full flex-1 p-6 pb-[100px]">
            <div className="h-full rounded-xl overflow-hidden shadow-lg">
              <MyMap setBounds={setBounds} category={selectedCategory} />
            </div>
          </div>

          {/* Drawer с событиями */}
          <EventsDrawer bounds={bounds} selectedCategory={selectedCategory} />
        </div>
      )}
    </>
  );
}
