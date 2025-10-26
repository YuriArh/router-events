import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { memo } from "react";
import { EventCard } from "~/modules/event/ui/event-card";
import type { Category } from "~/shared/model/Category";
import type { MapBounds } from "~/shared/model/Map";

export const EventList = memo(
  ({
    bounds,
    selectedCategory,
  }: {
    bounds: MapBounds | null;
    selectedCategory: Category;
  }) => {
    const {
      data: events,
      isLoading,
      error,
    } = useQuery({
      ...convexQuery(
        api.events.getInBounds,
        bounds?._sw && bounds?._ne
          ? {
              minLat: bounds._sw.lat,
              maxLat: bounds._ne.lat,
              minLng: bounds._sw.lng,
              maxLng: bounds._ne.lng,
              category: selectedCategory,
            }
          : "skip"
      ),
      placeholderData: (prev) => prev,
    });

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          Ошибка загрузки событий
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse h-64 rounded-lg"
            />
          ))}
        </div>
      );
    }

    if (!events || events.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">События не найдены</div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    );
  }
);

EventList.displayName = "EventList";
