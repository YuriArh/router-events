import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/shared/ui/drawer";
import { SNAP_POINTS } from "../constants";
import { EventList } from "./events-list";
import type { MapBounds } from "~/shared/model/Map";
import type { Category } from "~/shared/model/Category";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useQuery } from "@tanstack/react-query";

interface EventsDrawerProps {
  bounds: MapBounds | null;
  selectedCategory: Category;
}

/**
 * Drawer компонент для отображения списка событий на мобильных устройствах
 */
function EventsDrawerComponent({
  bounds,
  selectedCategory,
}: EventsDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS.MINIMAL);

  const { data: events } = useQuery({
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

  const hasEvents = events && events.length > 0;
  const snapPoints = hasEvents
    ? [SNAP_POINTS.MINIMAL, SNAP_POINTS.FULL]
    : [SNAP_POINTS.MINIMAL];

  return (
    <Drawer
      open={true}
      modal={false}
      shouldScaleBackground
      dismissible={false}
      activeSnapPoint={snap}
      snapPoints={snapPoints}
      setActiveSnapPoint={(newSnap) => {
        setSnap(newSnap);
      }}
    >
      <DrawerContent
        className="bg-white h-full !max-h-[calc(100vh-4rem)]"
        onClick={() => {
          setSnap(SNAP_POINTS.FULL);
        }}
      >
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-xl text-center font-semibold">
            {hasEvents && <span className="mr-2">{events.length}</span>}
            {hasEvents ? "события рядом с вами" : "Нет событий рядом с вами"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4 flex-1">
          <EventList bounds={bounds} selectedCategory={selectedCategory} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const EventsDrawer = EventsDrawerComponent;
