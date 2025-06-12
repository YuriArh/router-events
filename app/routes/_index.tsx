import type { Id } from "convex/_generated/dataModel";

import { useSearchParams } from "react-router";

import { Map as MyMap } from "~/modules/Map";
import type { Route } from "./+types/_index";
import { markerStylesheet } from "~/modules/Map";
import { useEffect } from "react";
import { getPublicEnv } from "env.common";
import { Header } from "~/modules/header";

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

  useEffect(() => {
    getEvent(eventId);
  }, [eventId]);

  return (
    <>
      <Header />
      <div className="relative flex flex-1 w-full">
        <MyMap />
      </div>
    </>
  );
}

const getEvent = async (eventId: Id<"events">) => {
  const url = `${getPublicEnv().convexUrl}/api/run/events/get/${eventId}`;
  const request = { args: { id: eventId }, format: "json" };

  const data = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  const result = await data.json();

  return result;
};
