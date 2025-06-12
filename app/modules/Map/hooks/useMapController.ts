import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Theme, useTheme } from "remix-themes";
import { getPublicEnv } from "env.common";
import consola from "consola";
import { useLocalStorage } from "~/shared/hooks/use-local-storage";

const API_KEY = getPublicEnv().maptilerKey;

export function useMapController({
  onMapClick,
  newEventMode,
}: {
  onMapClick?: (e: maplibregl.MapMouseEvent) => void;
  newEventMode?: boolean;
}) {
  const map = useRef<maplibregl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  const [lngLat, setLngLat] = useLocalStorage("lngLat", {
    longitude: 0,
    latitude: 0,
  });

  const [theme] = useTheme();

  const zoom = 14;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setLngLat({
            longitude,
            latitude,
          });

          map.current?.setCenter([longitude, latitude]);
        },
        (error) => {
          consola.error("Error get user location: ", error);
        }
      );
    } else {
      consola.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: `https://api.maptiler.com/maps/aquarelle${
        theme === Theme.DARK ? "-dark" : ""
      }/style.json?key=${API_KEY}`,
      center: [lngLat.longitude, lngLat.latitude],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-left");
    map.current.addControl(new maplibregl.GeolocateControl({}), "bottom-left");

    map.current.on("moveend", (e) => {
      const center = e.target.getCenter();

      setLngLat({
        longitude: center.lng,
        latitude: center.lat,
      });
    });
  }, [theme]);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(
        `https://api.maptiler.com/maps/aquarelle${
          theme === Theme.DARK ? "-dark" : ""
        }/style.json?key=${API_KEY}`
      );
    }
  }, [theme]);

  useEffect(() => {
    if (!map.current) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      onMapClick?.(e);
    };

    if (newEventMode) {
      map.current.on("click", handleClick);
    }

    return () => {
      map.current?.off("click", handleClick);
    };
  }, [newEventMode, onMapClick]);

  return { mapContainer, map: map.current };
}
