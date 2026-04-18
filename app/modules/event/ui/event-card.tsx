import { useState } from "react";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { format, isValid, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, Heart, Star } from "lucide-react";
import { api } from "convex/_generated/api";
import type { IEvent } from "../model";
import { cn } from "~/lib/utils";
import { Button } from "~/shared/ui/button";

interface EventCardProps {
  event: IEvent;
}

/** Стабильный «рейтинг» для списка (в схеме нет поля рейтинга). */
function displayRatingFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  const tenths = 42 + (Math.abs(h) % 9);
  return (tenths / 10).toFixed(1);
}

function formatEventWhen(date?: string, time?: string): string {
  if (!date && !time) return "Дата уточняется";
  let datePart = "";
  if (date) {
    try {
      const d = parseISO(date);
      datePart = isValid(d) ? format(d, "d MMMM", { locale: ru }) : date;
    } catch {
      datePart = date;
    }
  }
  const timePart = time?.trim() ?? "";
  if (datePart && timePart) return `${datePart} • ${timePart}`;
  return datePart || timePart;
}

function shortLocation(event: IEvent): string {
  const { city, state, formatted } = event.address;
  const line = [city, state].filter(Boolean).join(", ");
  return line || formatted;
}

export function EventCard({ event }: EventCardProps) {
  const [favorited, setFavorited] = useState(false);

  const isAttending = useQuery(api.events.isAttending, { eventId: event._id });

  const cover = event.images[0] ?? null;
  const rating = displayRatingFromId(event._id);

  return (
    <div className="relative flex flex-col">
      <Link
        to={`/event/${event._id}`}
        className="group flex flex-col rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`${event.title}, подробнее`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <CalendarDays
                className="size-12 opacity-35"
                strokeWidth={1.25}
                aria-hidden
              />
            </div>
          )}

          <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">
            Бесплатно
          </div>

          {isAttending ? (
            <div className="absolute bottom-3 right-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
              Иду
            </div>
          ) : null}
        </div>

        <div className="pt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-left text-sm font-semibold leading-snug text-foreground sm:text-base">
              {event.title}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
              <Star
                className="size-4 fill-primary/25 text-primary"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-sm font-medium tabular-nums">{rating}</span>
            </div>
          </div>
          <p className="mt-1 line-clamp-1 text-left text-sm text-muted-foreground">
            {shortLocation(event)}
          </p>
          <p className="mt-0.5 text-left text-sm text-muted-foreground">
            {formatEventWhen(event.date, event.time)}
          </p>
        </div>
      </Link>

      <Button
        aria-label={favorited ? "Убрать из избранного" : "В избранное"}
        aria-pressed={favorited}
        className={cn(
          "absolute right-2.5 top-2.5 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        onClick={() => setFavorited((v) => !v)}
      >
        <Heart
          className={cn(
            "size-5",
            favorited ? "fill-primary text-primary" : "text-foreground"
          )}
          strokeWidth={1.75}
        />
      </Button>
    </div>
  );
}
