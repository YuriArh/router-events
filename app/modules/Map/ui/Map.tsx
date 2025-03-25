import { latitude, longitude } from "~/modules/new-event";
import { useMapController } from "../hooks/useMapController";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSearchParams } from "react-router";

export function CustomMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewEventModalOpen = searchParams.get("newEvent") === "true";

  const { mapContainer } = useMapController({
    onEventClick: (e) => {
      latitude.value = e.lngLat.lat;
      longitude.value = e.lngLat.lng;
    },
    shouldMarkerAddedOnClick: isNewEventModalOpen,
  });

  const events = useQuery(convexQuery(api.events.list, {}));

  return <div ref={mapContainer} className="map flex-1" />;
}
