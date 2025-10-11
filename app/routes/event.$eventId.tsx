import { useState } from "react";
import type { Route } from "./+types/event.$eventId";
import { api } from "convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";
import { useParams } from "react-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import markerStylesheet from "~/modules/Map/styles/icon.css?url";
import { Header } from "~/modules/header";
import { ProfilePicture } from "~/modules/user";
import ReactMap, { Marker } from "react-map-gl/maplibre";
import { getPublicEnv } from "env.common";
import { ConvexHttpClient } from "convex/browser";
import { Button } from "~/shared/ui/button";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: markerStylesheet },
];

export const handle = {
  i18n: "common",
};

export async function loader({ params }: Route.LoaderArgs) {
  const { eventId } = params as { eventId: Id<"events"> };
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not defined");
  }
  const convex = new ConvexHttpClient(convexUrl);
  const event = await convex.query(api.events.get, { eventId });

  return {
    event,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.event) {
    return [
      { title: "Event not found" },
      { name: "description", content: "Event not found" },
    ];
  }

  return [
    { title: data.event.title },
    { name: "description", content: data.event.description },
  ];
}

export default function EventRoute({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData;
  const { eventId } = useParams<{ eventId: Id<"events"> }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useTranslation();

  if (!eventId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("Event.notFound")}</p>
        </div>
      </div>
    );
  }

  const { data, isLoading } = useQuery({
    ...convexQuery(api.events.get, { eventId }),
    initialData: event,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("Event.loading")}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("Event.notFound")}</p>
        </div>
      </div>
    );
  }

  const currentImage = data.images?.[currentImageIndex];
  const hasImages = (data.images?.length ?? 0) > 0;

  return (
    <div className=" flex flex-col bg-background">
      <Header />

      {/* Hero Image Section */}
      {hasImages && currentImage ? (
        <div className="relative w-full h-[40vh] md:h-[50vh] bg-muted">
          <img
            src={currentImage}
            alt={data.title}
            className="w-full h-full object-cover"
          />

          {/* Image thumbnails */}
          {data.images && data.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {data.images.slice(0, 5).map((image, index) => (
                <button
                  key={`thumb-${image}`}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-white w-6"
                      : "bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-[40vh] md:h-[50vh] bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
          <svg
            className="w-24 h-24 text-muted-foreground/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {data.title}
              </h1>

              {/* Event Details Pills */}
              <div className="flex flex-wrap gap-2">
                {data.date && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm">
                    <svg
                      className="w-4 h-4 text-secondary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium text-secondary-foreground">
                      {format(new Date(data.date), "dd MMMM yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Organizer Info */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                {t("Event.hostedBy")}
              </h2>
              <div className="flex items-center gap-3">
                <ProfilePicture id={data.organizerId} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Description */}
            {data.description && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("Event.description")}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {data.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Location Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t("Event.location")}
              </h2>

              {/* Address */}
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-foreground font-medium">
                    {data.address.formatted}
                  </p>
                </div>
              </div>

              {/* Map */}
              <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-md">
                <ReactMap
                  style={{ width: "100%", height: "100%" }}
                  initialViewState={{
                    longitude: data.address.lon,
                    latitude: data.address.lat,
                    zoom: 14,
                  }}
                  mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${
                    getPublicEnv().maptilerKey
                  }`}
                >
                  <Marker
                    longitude={data.address.lon}
                    latitude={data.address.lat}
                  />
                </ReactMap>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <div className="border border-border rounded-xl shadow-lg p-6 space-y-6 bg-card">
                {/* Event Details Card */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {t("Event.details")}
                  </h3>

                  {data.date && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {t("Event.date")}
                      </p>
                      <p className="text-card-foreground font-medium">
                        {format(new Date(data.date), "EEEE, dd MMMM yyyy")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <Button size="lg" className="w-full">
                    {t("Event.join")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    {t("Event.share")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
