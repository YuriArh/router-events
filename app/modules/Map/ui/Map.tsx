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
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { MapMarker } from "../components/MapMarker";
import type { IEvent } from "~/modules/event/model";

const API_KEY = getPublicEnv().maptilerKey;

type CustomMapProps = {
  setBounds: (bounds: {
    _sw: { lat: number; lng: number };
    _ne: { lat: number; lng: number };
  }) => void;
};

function CustomMap({ setBounds }: CustomMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [lngLat, setLngLat] = useLocalStorage("lngLat", {
    longitude: 0,
    latitude: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
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

  const { data: events } = useQuery(convexQuery(api.events.list, {}));

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
      mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`}
    >
      <GeolocateControl />
      <ScaleControl />
      {events?.map((event) => (
        <div key={event._id}>
          <Marker
            longitude={event.address.lon}
            latitude={event.address.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedEvent(event);
            }}
          />
          {selectedEvent?._id === event._id && (
            <Popup
              longitude={event.address.lon}
              latitude={event.address.lat}
              anchor="bottom"
              offset={40}
              onClose={() => setSelectedEvent(null)}
              closeButton={false}
              maxWidth="320px"
              style={{ padding: 0, borderRadius: 20 }}
              className="rounded-2xl shadow-2xl border overflow-hidden w-[500px]"
            >
              <MapMarker
                marker={event}
                onEventClick={() => {
                  navigate(`/event/${event._id}`);
                }}
                onClose={() => setSelectedEvent(null)}
              />
            </Popup>
          )}
        </div>
      ))}
    </MapGL>
  );
}

export const MyMap = memo<CustomMapProps>(CustomMap);
