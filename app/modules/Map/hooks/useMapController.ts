import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Theme, useTheme } from "remix-themes";
import { getPublicEnv } from "env.common";
import type { LocationInfo } from "~/shared/types/LocationInfo";
import type { Doc } from "convex/_generated/dataModel";

const API_KEY = getPublicEnv().maptilerKey;

/**
 * Controller for Map
 * @date 3/13/2024 - 10:17:04 PM
 */
export function useMapController({
  onEventClick,
  shouldMarkerAddedOnClick,
  markers = [],
}: {
  onEventClick: (e: maplibregl.MapMouseEvent) => void;
  shouldMarkerAddedOnClick?: boolean;
  markers?: Doc<"events">[];
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
  }, [theme]);

  useEffect(() => {
    // Create a single marker reference
    let currentMarker: maplibregl.Marker | null = null;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      // Remove existing marker if there is one
      if (currentMarker) {
        currentMarker.remove();
      }

      // Create a new marker at the clicked location
      currentMarker = new maplibregl.Marker({
        color: "#FF0000",
      })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map.current as maplibregl.Map);

      onEventClick(e);
    };

    // Clean up function to remove marker and event listener
    const cleanupMapEvents = () => {
      // Remove the marker if it exists
      if (currentMarker) {
        currentMarker.remove();
        currentMarker = null;
      }

      // Remove event listener
      map.current?.off("click", handleClick);
    };

    if (shouldMarkerAddedOnClick) {
      // Add click event if enabled
      map.current?.on("click", handleClick);
    } else {
      // Clean up when disabled
      cleanupMapEvents();
    }

    // Clean up when component unmounts or when dependencies change
    return () => {
      cleanupMapEvents();
    };
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

  useEffect(() => {
    if (markers) {
      for (const marker of markers) {
        new maplibregl.Marker({
          color: "#EF4444",
        })
          .setLngLat([marker.location.longitude, marker.location.latitude])
          .addTo(map.current as maplibregl.Map);
      }
    }
  }, [markers]);

  return { mapContainer };
}
