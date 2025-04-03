import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useSearchParams } from "react-router";
import { Event } from "~/modules/event";
import { Map as MyMap } from "~/modules/Map";
import type { Route } from "./+types/_index";
import { markerStylesheet } from "~/modules/Map";

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
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") as Id<"events">;
  return (
    <div className="relative flex flex-1 w-full">
      <MyMap />
      {eventId && <Event eventId={eventId} />}
    </div>
  );
}
