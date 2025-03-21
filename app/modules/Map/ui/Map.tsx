import { useMapController } from "../hooks/useMapController";

export function CustomMap() {
  const { mapContainer } = useMapController();

  return <div ref={mapContainer} className="map flex-1" />;
}
