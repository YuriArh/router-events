import { Theme, useTheme } from "remix-themes";
import MapGL, {
  GeolocateControl,
  ScaleControl,
  type MapRef,
  Marker,
  Popup,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useLocalStorage } from "~/shared/hooks/use-local-storage";
import { getPublicEnv } from "env.common";
import "maplibre-gl/dist/maplibre-gl.css";
import { memo, useRef, useState } from "react";
import type { Doc } from "convex/_generated/dataModel";
import { MarkerPopup } from "../components/MarkerPopup";
import { useNavigate } from "react-router";
import isEqual from "react-fast-compare";

const API_KEY = getPublicEnv().maptilerKey;

type CustomMapProps = {
  events: Doc<"events">[] | undefined;
  setBounds: (bounds: {
    _sw: { lat: number; lng: number };
    _ne: { lat: number; lng: number };
  }) => void;
};

function CustomMap({ events, setBounds }: CustomMapProps) {
  const [theme] = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [lngLat, setLngLat] = useLocalStorage("lngLat", {
    longitude: 0,
    latitude: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<Doc<"events"> | null>(
    null
  );
  const navigate = useNavigate();

  const handleMove = (e?: ViewStateChangeEvent) => {
    if (e) {
      setLngLat(e.viewState);
      const bounds = e.target.getBounds();
      if (bounds) {
        setBounds({
          _sw: { lat: bounds.getSouth(), lng: bounds.getWest() },
          _ne: { lat: bounds.getNorth(), lng: bounds.getEast() },
        });
      }
      return;
    }
    const bounds = mapRef.current?.getBounds();
    if (bounds) {
      setBounds({
        _sw: { lat: bounds.getSouth(), lng: bounds.getWest() },
        _ne: { lat: bounds.getNorth(), lng: bounds.getEast() },
      });
    }
  };

  return (
    <MapGL
      ref={mapRef}
      onMove={handleMove}
      onLoad={() => handleMove()}
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
              setSelectedEvent(event);
            }}
          />
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
    </MapGL>
  );
}

export const MyMap = memo<CustomMapProps>(CustomMap, (prev, next) =>
  isEqual(prev.events, next.events)
);
