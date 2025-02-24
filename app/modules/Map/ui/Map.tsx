import {
  Map as RMap,
  GeolocateControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import { Theme, useTheme } from "remix-themes";
import { useMapController } from "../hooks/useMapController";

export function CustomMap() {
  const { viewState, handleMove } = useMapController();

  const [theme] = useTheme();

  return (
    <RMap
      {...viewState}
      style={{ flex: 1 }}
      mapStyle={`https://api.maptiler.com/maps/streets-v2${
        theme === Theme.DARK ? "-dark" : ""
      }/style.json?key=${env.NEXT_PUBLIC_MAP_KEY}`}
      onMove={handleMove}
      initialViewState={{ zoom: 14 }}
    >
      <GeolocateControl position="bottom-left" />
      <NavigationControl position="top-left" />
    </RMap>
  );
}
