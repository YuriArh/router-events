import { useCallback, useLayoutEffect, useState } from "react";
import type { ViewStateChangeEvent } from "react-map-gl/maplibre";

/**
 * Controller for Map
 * @date 3/13/2024 - 10:17:04 PM
 *
 * @export
 * @returns {{ viewState: any; setViewState: any; handleMove: any; events: any; loading: any; }}
 */

export function useMapController() {
  const [viewState, setViewState] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);

  /**
   * init user location
   */
  useLayoutEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setViewState({ latitude, longitude, zoom: 14 });
        },

        (error) => {
          console.error("Error get user location: ", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  /**
   * handles changes in map state
   */
  const handleMove = useCallback(({ viewState }: ViewStateChangeEvent) => {
    setViewState({ ...viewState });
  }, []);

  return { viewState, setViewState, handleMove };
}
