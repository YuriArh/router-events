import type { Route } from "./+types/event.$eventId";
import { api } from "convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import type { Doc, Id } from "convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";
import { useParams } from "react-router";
import { format } from "date-fns";
import MapView from "~/shared/ui/map-view";
import markerStylesheet from "~/modules/Map/styles/icon.css?url";
import { Header } from "~/modules/header";
import { ProfilePicture } from "~/modules/user";
import Map, { Marker } from "react-map-gl/maplibre";
import { getPublicEnv } from "env.common";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: markerStylesheet },
];

export async function loader({ params }: Route.LoaderArgs) {
  const { eventId } = params;

  const convexDeploymentUrl = import.meta.env.VITE_CONVEX_URL;
  const convexSiteUrl = convexDeploymentUrl.endsWith(".cloud")
    ? `${convexDeploymentUrl.substring(
        0,
        convexDeploymentUrl.length - ".cloud".length
      )}.site`
    : convexDeploymentUrl;

  const event = (await fetch(`${convexSiteUrl}/api/events/${eventId}`).then(
    (res) => res.json()
  )) as Doc<"events">;

  return {
    event,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data.event.title },
    { name: "description", content: data.event.description },
  ];
}

export default function EventRoute({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData;
  const { eventId } = useParams<{ eventId: Id<"events"> }>();

  if (!eventId) {
    return <div>Event not found</div>;
  }

  const { data, isLoading } = useQuery({
    ...convexQuery(api.events.get, { eventId }),
    initialData: event,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Event not found</div>;
  }

  const eventMarker = [
    {
      _id: data._id,
      title: data.title,
      location: {
        lat: data.location.latitude,
        lng: data.location.longitude,
      },
    },
  ];

  return (
    <div className="flex-1 h-full flex flex-col">
      <Header />
      <div className="w-screen flex-1 flex flex-col max-w-7xl mx-auto">
        <ProfilePicture id={data.user} />
        <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
        <p className="text-gray-600 mb-6">{data.description}</p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Event Details</h2>
          {data.date && <p>Date: {format(data.date, "MM.dd.yyyy")}</p>}
          {/* <p>Time: {event.time}</p>
        <p>Privacy: {event.isPrivate ? "Private" : "Public"}</p> */}
        </div>

        {data.images && data.images.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Photos</h2>
            <div className="flex flex-wrap gap-4">
              {data.images.map(
                (url: string | null, index: number) =>
                  url && (
                    <img
                      key={url}
                      src={url}
                      alt={`Event  ${index + 1}`}
                      className="w-min h-48 object-contain rounded-lg"
                    />
                  )
              )}
            </div>
          </div>
        )}
        <div className="mb-6 flex-1 flex flex-col max-h-1/3">
          <h2 className="text-xl font-semibold mb-2">Location</h2>

          <Map
            style={{ width: "100%", height: "100%" }}
            initialViewState={{
              longitude: data.location.longitude,
              latitude: data.location.latitude,
              zoom: 14,
            }}
            mapStyle={`https://api.maptiler.com/maps/aquarelle-dark/style.json?key=${
              getPublicEnv().maptilerKey
            }`}
          >
            {eventMarker.map((marker) => (
              <Marker
                key={marker._id}
                longitude={marker.location.lng}
                latitude={marker.location.lat}
              />
            ))}
          </Map>
        </div>
      </div>
    </div>
  );
}
