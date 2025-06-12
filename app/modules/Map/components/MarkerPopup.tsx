import type { Doc } from "convex/_generated/dataModel";
import { Theme } from "remix-themes";
import { Button } from "~/shared/ui/button";

interface MarkerPopupProps {
  marker: Doc<"events">;
  onEventClick?: (marker: Doc<"events">) => void;
}

export function MarkerPopup({ marker, onEventClick }: MarkerPopupProps) {
  return (
    <div className=" w-full p-2.5 rounded-2xl">
      <h3 className="text-lg font-semibold mb-2 ">{marker.title}</h3>

      {marker.description && (
        <p className="text-sm  mb-2">{marker.description}</p>
      )}

      {marker.date && (
        <p className="text-sm  mb-2">
          {new Date(marker.date).toLocaleDateString()}
        </p>
      )}

      {marker.titleImage && (
        <div className="flex gap-2 overflow-x-auto mb-2">
          <img
            src={marker.titleImage}
            className="w-20 h-20 object-cover rounded"
            alt={`Event image`}
          />
        </div>
      )}

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(marker);
        }}
      >
        View Details
      </Button>
    </div>
  );
}
