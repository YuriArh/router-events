import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Theme, useTheme } from "remix-themes";
import { getPublicEnv } from "env.common";

const API_KEY = getPublicEnv().maptilerKey;

/**
 * Controller for Map
 * @date 3/13/2024 - 10:17:04 PM
 */
export function useMapController({
  onEventClick,
  shouldMarkerAddedOnClick,
}: {
  onEventClick: (e: maplibregl.MapMouseEvent) => void;
  shouldMarkerAddedOnClick?: boolean;
}) {
  const map = useRef<maplibregl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  const [theme] = useTheme();

  const lng = 139.753;
  const lat = 35.6844;
  const zoom = 14;

  /**
   * init user location
   */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          map.current?.setCenter([longitude, latitude]);
        },

        (error) => {
          console.error("Error get user location: ", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: `https://api.maptiler.com/maps/aquarelle${
        theme === Theme.DARK ? "-dark" : ""
      }/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-left");
    map.current.addControl(new maplibregl.GeolocateControl({}), "bottom-left");
  }, []);

  useEffect(() => {
    const Marker: maplibregl.Marker = new maplibregl.Marker({
      color: "#FF0000",
    });

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      Marker?.remove();

      Marker.setLngLat([e.lngLat.lng, e.lngLat.lat]).addTo(
        map.current as maplibregl.Map
      );

      onEventClick(e);
    };

    map.current?.on("click", handleClick);

    if (!shouldMarkerAddedOnClick) {
      map.current?.off("click", handleClick);
      Marker?.remove();
    }
  }, [shouldMarkerAddedOnClick, onEventClick]);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(
        `https://api.maptiler.com/maps/aquarelle${
          theme === Theme.DARK ? "-dark" : ""
        }/style.json?key=${API_KEY}`
      );
    }
  }, [theme]);

  return { mapContainer };
}
