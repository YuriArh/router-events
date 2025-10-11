import { MyMap } from "~/modules/Map";
import type { Route } from "./+types/_index";
import { markerStylesheet } from "~/modules/Map";
import { Header } from "~/modules/header";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { EventCard } from "~/modules/event";
import { CategorySelector } from "~/modules/event/ui/category-selector";
import type { IEvent } from "~/modules/event/model";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: markerStylesheet },
];

export function meta() {
  return [
    { title: "EventApp" },
    { name: "description", content: "Welcome to EventApp!" },
  ];
}

export default function Home() {
  const [bounds, setBounds] = useState<{
    _sw: { lat: number; lng: number };
    _ne: { lat: number; lng: number };
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<
    | "music"
    | "sports"
    | "art"
    | "food"
    | "science"
    | "technology"
    | "other"
    | null
  >(null);

  const { data: events } = useQuery({
    ...convexQuery(
      api.events.getInBounds,
      bounds?._sw && bounds?._ne
        ? {
            minLat: bounds._sw.lat,
            maxLat: bounds._ne.lat,
            minLng: bounds._sw.lng,
            maxLng: bounds._ne.lng,
          }
        : "skip"
    ),
    placeholderData: (prev) => prev,
  });

  // Фильтруем события по выбранной категории
  const filteredEvents = selectedCategory
    ? events?.filter((event) => event.category === selectedCategory)
    : events;

  return (
    <>
      <Header />
      <div className="relative flex w-full h-[calc(100vh-4rem)] bg-gray-50">
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

            <EventList events={filteredEvents} />
          </div>
        </div>
        <div className="w-1/2 pr-6 py-6">
          <div className="h-full rounded-xl overflow-hidden shadow-lg">
            <MyMap setBounds={setBounds} />
          </div>
        </div>
      </div>
    </>
  );
}

function EventList({ events }: { events: IEvent[] | undefined }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {events?.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
