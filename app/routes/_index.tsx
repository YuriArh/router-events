import { MyMap } from "~/modules/Map";
import type { Route } from "./+types/_index";
import { markerStylesheet } from "~/modules/Map";
import { Header } from "~/modules/header";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useState } from "react";
import { EventCard } from "~/modules/event";
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

  return (
    <>
      <Header />
      <div className="relative flex flex-1 w-full">
        <div className="w-1/4 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Events in View</h2>

          <EventList events={events} />
        </div>
        <div className="w-3/4">
          <MyMap setBounds={setBounds} />
        </div>
      </div>
    </>
  );
}

function EventList({ events }: { events: IEvent[] | undefined }) {
  // events теперь можно фильтровать по bounds, если нужно, либо просто использовать events
  return (
    <div className="space-y-4">
      {events?.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
