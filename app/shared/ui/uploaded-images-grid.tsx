import { X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

interface UploadedImagesGridProps {
  storageIds: Id<"_storage">[];
  onRemove: (index: number) => void;
}

export function UploadedImagesGrid({
  storageIds,
  onRemove,
}: UploadedImagesGridProps) {
  if (storageIds.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {storageIds.map((storageId, index) => (
          <ImageCard
            key={storageId}
            storageId={storageId}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface ImageCardProps {
  storageId: Id<"_storage">;
  onRemove: () => void;
}

function ImageCard({ storageId, onRemove }: ImageCardProps) {
  const imageUrl = useQuery(api.events.getImageUrl, { storageId });

  if (imageUrl === undefined) {
    return (
      <div className="relative aspect-square w-full">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  if (imageUrl === null) {
    return (
      <div className="relative aspect-square w-full">
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-destructive bg-destructive/10">
          <p className="text-xs text-destructive">Ошибка загрузки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
      <img
        src={imageUrl}
        alt="Uploaded"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Overlay с кнопкой удаления */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8 shadow-lg"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Удалить изображение</span>
        </Button>
      </div>
    </div>
  );
}
