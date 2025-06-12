import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Id } from "convex/_generated/dataModel";
import { getPublicEnv } from "env.common";
import MarkerIcon from "~/assets/location-pin.png";

interface Event {
  _id: Id<"events">;
  title: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers: Event[];
  onMarkerClick?: (event: Event) => void;
  onMapClick?: (coords: [number, number]) => void;
}

const API_KEY = getPublicEnv().maptilerKey;

export default function MapView({
  center,
  zoom,
  markers,
  onMarkerClick,
  onMapClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/aquarelle-dark/style.json?key=${API_KEY}`,
      center,
      zoom,
    });

    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, onMapClick]);

  useEffect(() => {
    if (!map.current) return;
    // Remove markers that are no longer in the data
    for (const [id, marker] of Object.entries(markersRef.current)) {
      if (!markers.find((m) => m._id === id)) {
        marker.remove();
        delete markersRef.current[id];
      }
    }

    // Add or update markers
    for (const event of markers) {
      if (!markersRef.current[event._id]) {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(${MarkerIcon})`;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([event.location.lng, event.location.lat])
          .addTo(map.current as maplibregl.Map);

        if (onMarkerClick) {
          el.addEventListener("click", () => onMarkerClick(event));
        }

        markersRef.current[event._id] = marker;
      } else {
        markersRef.current[event._id].setLngLat([
          event.location.lng,
          event.location.lat,
        ]);
      }
    }
  }, [markers, onMarkerClick]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
