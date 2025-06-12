import { latitude, longitude } from "~/modules/new-event";
import { useMapController } from "../hooks/useMapController";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { MapMarker } from "../components/MapMarker";
import { Theme, useTheme } from "remix-themes";
import { useNavigate, useSearchParams } from "react-router";
import Map, {
  GeolocateControl,
  Marker,
  Popup,
  ScaleControl,
} from "react-map-gl/maplibre";
import { useLocalStorage } from "~/shared/hooks/use-local-storage";
import { getPublicEnv } from "env.common";
import maplibregl from "maplibre-gl";
import { useCallback, useMemo, useState } from "react";
import { MarkerPopup } from "../components/MarkerPopup";
import type { Doc } from "convex/_generated/dataModel";

const API_KEY = getPublicEnv().maptilerKey;

export function CustomMap() {
  const [searchParams] = useSearchParams();
  const isNewEventModalOpen = searchParams.get("newEvent") === "true";
  const { data: events } = useQuery(convexQuery(api.events.list, {}));
  const [theme] = useTheme();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Doc<"events"> | null>(
    null
  );

  const [lngLat, setLngLat] = useLocalStorage("lngLat", {
    longitude: 0,
    latitude: 0,
  });

  const handleMarkerClick = useCallback((event: Doc<"events">) => {
    setSelectedEvent(event);
  }, []);

  return (
    <Map
      onMove={(e) => setLngLat(e.viewState)}
      style={{ width: "100%", height: "100%" }}
      initialViewState={{
        longitude: lngLat.longitude,
        latitude: lngLat.latitude,
        zoom: 14,
      }}
      mapStyle={`https://api.maptiler.com/maps/aquarelle${
        theme === Theme.DARK ? "-dark" : ""
      }/style.json?key=${API_KEY}`}
    >
      <GeolocateControl />
      <ScaleControl />
      {events?.map((event) => (
        <div key={event._id}>
          <Marker
            longitude={event.location.longitude}
            latitude={event.location.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(event);
            }}
          ></Marker>

          {selectedEvent?._id === event._id && (
            <Popup
              longitude={event.location.longitude}
              latitude={event.location.latitude}
              anchor="bottom"
              offset={40}
              onClose={() => setSelectedEvent(null)}
              closeButton={false}
              style={{ width: 500, padding: 0 }}
              className="rounded-2xl"
            >
              <MarkerPopup
                marker={event}
                onEventClick={() => {
                  navigate(`/event/${event._id}`);
                }}
              />
            </Popup>
          )}
        </div>
      ))}
    </Map>
  );
}
