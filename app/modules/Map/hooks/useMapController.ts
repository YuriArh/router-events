import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import maplibregl from "maplibre-gl";
import { Theme, useTheme } from "remix-themes";
import { getPublicEnv } from "env.common";
import type { ViewStateChangeEvent } from "node_modules/@vis.gl/react-maplibre/dist/types/events";
import consola from "consola";

/**
 * Controller for Map
 * @date 3/13/2024 - 10:17:04 PM
 *
 * @export
 * @returns {{ viewState: any; setViewState: any; handleMove: any; events: any; loading: any; }}
 */

export function useMapController() {
  const map = useRef<maplibregl.Map | null>(null);
  const [theme] = useTheme();
  const API_KEY = getPublicEnv().maptilerKey;
  const mapContainer = useRef<HTMLDivElement>(null);

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
  }, [API_KEY, theme]);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(
        `https://api.maptiler.com/maps/aquarelle${
          theme === Theme.DARK ? "-dark" : ""
        }/style.json?key=${API_KEY}`
      );
    }
  }, [theme, API_KEY]);

  return { mapContainer };
}
