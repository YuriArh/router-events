import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Doc } from "convex/_generated/dataModel";
import { Theme } from "remix-themes";
import MarkerIcon from "~/assets/location-pin.png";
import { cn } from "~/shared/lib/utils";
import { createRoot } from "react-dom/client";

interface MapMarkerProps {
  marker: Doc<"events">;
  onEventClick?: (marker: Doc<"events">) => void;
  theme?: Theme;
}

export function MapMarker({ marker, onEventClick, theme }: MapMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "marker relative cursor-pointer transition-all duration-300",
        isOpen ? "scale-110" : "scale-100"
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div
        className="w-8 h-8 bg-cover bg-center"
        style={{ backgroundImage: `url(${MarkerIcon})` }}
      />
      <div
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all duration-300",
          "shadow-lg",
          theme === Theme.DARK ? "bg-black text-white" : "bg-white text-black",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {marker.title}
      </div>
      <div
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[300px] p-4 rounded-lg transition-all duration-300",
          "shadow-lg",
          theme === Theme.DARK ? "bg-black text-white" : "bg-white text-black",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <h3 className="text-lg font-semibold mb-2">{marker.title}</h3>
        {marker.description && (
          <p className="text-sm mb-2">{marker.description}</p>
        )}
        {marker.date && (
          <p className="text-sm text-gray-500 mb-2">
            {new Date(marker.date).toLocaleDateString()}
          </p>
        )}
        {marker.images && marker.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-2">
            {marker.images.map((imageId, index) => (
              <img
                key={index}
                src={`/api/storage/${imageId}`}
                className="w-20 h-20 object-cover rounded"
                alt={`Event image ${index + 1}`}
              />
            ))}
          </div>
        )}
        <button
          className={cn(
            "w-full py-2 px-4 rounded transition-colors",
            theme === Theme.DARK
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-black text-white hover:bg-gray-800"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick?.(marker);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
