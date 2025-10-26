import { useState } from "react";
import type { Route } from "./+types/event.$eventId";
import { api } from "convex/_generated/api";
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
import { useMutation, useQuery as useConvexQuery } from "convex/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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

  const toggleAttendance = useMutation(
    api.events.toggleAttendance
  ).withOptimisticUpdate((state, { eventId }) => {
    const currentValue = state.getQuery(api.events.isAttending, { eventId });

    if (currentValue) {
      state.setQuery(api.events.isAttending, { eventId }, !currentValue);
    }
  });

  const isAttending = useConvexQuery(api.events.isAttending, {
    eventId: eventId as Id<"events">,
  });

  const handleAttendanceToggle = async () => {
    if (!eventId) return;
    try {
      await toggleAttendance({ eventId: eventId as Id<"events"> });
    } catch (error) {
      console.error("Failed to toggle attendance:", error);
    }
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("Event.linkCopied"));
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error(t("Event.errorCopyLink"));
    }
  };

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

                  {data.socialLinks && data.socialLinks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {t("Event.socialLinks")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data.socialLinks.map((link, index) => (
                          <a
                            key={`${link.url}-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                            title={link.label || link.type}
                          >
                            {link.type === "telegram" && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                              </svg>
                            )}
                            {link.type === "instagram" && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            )}
                            {link.type === "facebook" && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            )}
                            {link.type === "twitter" && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            )}
                            {link.type === "youtube" && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                            )}
                            {link.type === "website" && (
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
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                />
                              </svg>
                            )}
                            {![
                              "telegram",
                              "instagram",
                              "facebook",
                              "twitter",
                              "youtube",
                              "website",
                            ].includes(link.type) && (
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
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                            )}
                            <span className="text-card-foreground font-medium">
                              {link.label || link.type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <Button
                    size="lg"
                    className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    onClick={handleAttendanceToggle}
                    disabled={isAttending === undefined}
                  >
                    {isAttending ? t("Event.leave") : t("Event.join")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 group transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
                    onClick={handleShareClick}
                  >
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
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
