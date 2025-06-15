import { MyMap } from "~/modules/Map";
import type { Route } from "./+types/_index";
import { markerStylesheet } from "~/modules/Map";
import { Header } from "~/modules/header";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { Link } from "react-router";
import { useState } from "react";

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
          <MyMap events={events} setBounds={setBounds} />
        </div>
      </div>
    </>
  );
}

function EventList({
  events,
}: {
  events: (Doc<"events"> & { titleImage: string | null })[] | undefined;
}) {
  // events теперь можно фильтровать по bounds, если нужно, либо просто использовать events
  return (
    <div className="space-y-4">
      {events?.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}

function EventCard({
  event,
}: {
  event: Doc<"events"> & { titleImage: string | null };
}) {
  return (
    <Link to={`/event/${event._id}`}>
      <div className="border-2 border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {event.titleImage && (
          <img
            src={event.titleImage}
            alt={event.title}
            className="w-full h-32 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="font-bold text-lg">{event.title}</h3>
          <p className="text-sm text-gray-600">{event.date}</p>
          <p className="text-sm text-gray-800 mt-2">{event.description}</p>
        </div>
      </div>
    </Link>
  );
}
