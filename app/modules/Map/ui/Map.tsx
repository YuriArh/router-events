import { Theme, useTheme } from "remix-themes";
import { useMapController } from "../hooks/useMapController";
import RMap, {
  GeolocateControl,
  NavigationControl,
} from "@vis.gl/react-maplibre";
import { getPublicEnv } from "env.common";

export function CustomMap() {
  const { viewState, handleMove } = useMapController();

  const [theme] = useTheme();

  return (
    <RMap
      {...viewState}
      style={{ flex: 1, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
      mapStyle={`https://api.maptiler.com/maps/aquarelle${
        theme === Theme.DARK ? "-dark" : ""
      }/style.json?key=${getPublicEnv().maptilerKey}`}
      onMove={handleMove}
      initialViewState={{ zoom: 14 }}
    >
      <GeolocateControl position="bottom-left" />
      <NavigationControl position="top-left" />
    </RMap>
  );
}
