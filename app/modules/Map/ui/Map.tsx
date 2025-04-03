import { latitude, longitude } from "~/modules/new-event";
import { useMapController } from "../hooks/useMapController";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSearchParams } from "react-router";

export function CustomMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewEventModalOpen = searchParams.get("newEvent") === "true";
  const { data: events } = useQuery(convexQuery(api.events.list, {}));

  const { mapContainer } = useMapController({
    onEventClick: (e) => {
      latitude.value = e.lngLat.lat;
      longitude.value = e.lngLat.lng;
    },
    newEventMode: isNewEventModalOpen,
    markers: events,
  });

  return <div ref={mapContainer} className="map flex-1" />;
}
