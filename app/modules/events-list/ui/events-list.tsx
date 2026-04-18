import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { isValid, parseISO } from "date-fns";
import { SlidersHorizontal } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { EventCard } from "~/modules/event/ui/event-card";
import type { IEvent } from "~/modules/event/model";
import type { Category } from "~/shared/model/Category";
import type { MapBounds } from "~/shared/model/Map";
import { Button } from "~/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/shared/ui/sheet";
import { cn } from "~/lib/utils";

type SortMode = "popular" | "date";

function eventsCountLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} событие рядом`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${n} события рядом`;
  }
  return `${n} событий рядом`;
}

function sortEvents(events: IEvent[], mode: SortMode): IEvent[] {
  const copy = [...events];
  if (mode === "popular") {
    copy.sort((a, b) => b.attendeeCount - a.attendeeCount);
    return copy;
  }
  copy.sort((a, b) => {
    const ta = a.date ? parseISO(a.date).getTime() : Number.POSITIVE_INFINITY;
    const tb = b.date ? parseISO(b.date).getTime() : Number.POSITIVE_INFINITY;
    const da = Number.isFinite(ta) && isValid(new Date(ta)) ? ta : Number.POSITIVE_INFINITY;
    const db = Number.isFinite(tb) && isValid(new Date(tb)) ? tb : Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return a.title.localeCompare(b.title, "ru");
  });
  return copy;
}

export const EventList = memo(
  ({
    bounds,
    selectedCategory,
  }: {
    bounds: MapBounds | null;
    selectedCategory: Category;
  }) => {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>("popular");

    const {
      data: events,
      isLoading,
      error,
    } = useQuery({
      ...convexQuery(
        api.events.getInBounds,
        bounds?._sw && bounds?._ne
          ? {
              minLat: bounds._sw.lat,
              maxLat: bounds._ne.lat,
              minLng: bounds._sw.lng,
              maxLng: bounds._ne.lng,
              category: selectedCategory,
            }
          : "skip"
      ),
      placeholderData: (prev) => prev,
    });

    const sortedEvents = useMemo(
      () => (events?.length ? sortEvents(events, sortMode) : events),
      [events, sortMode]
    );

    if (error) {
      return (
        <div className="py-8 text-center text-destructive">
          Ошибка загрузки событий
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex h-9 items-center justify-between gap-3">
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!sortedEvents || sortedEvents.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          События не найдены
        </div>
      );
    }

    const countLabel = eventsCountLabel(sortedEvents.length);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground sm:text-base">
            {countLabel}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-2 rounded-full border-border bg-background px-4 font-medium shadow-xs"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Фильтры
          </Button>
        </div>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Фильтры</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4 pb-6">
              <p className="text-sm text-muted-foreground">Сортировка</p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSortMode("popular")}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    sortMode === "popular"
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-background hover:bg-muted/60"
                  )}
                >
                  Сначала популярные
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    По числу участников
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("date")}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    sortMode === "date"
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-background hover:bg-muted/60"
                  )}
                >
                  По дате <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    Ближайшие сверху
                  </span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
          {sortedEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    );
  }
);

EventList.displayName = "EventList";
