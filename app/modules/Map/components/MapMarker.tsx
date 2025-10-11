import { useState } from "react";
import { Theme } from "remix-themes";
import { cn } from "~/shared/lib/utils";
import type { IEvent } from "~/modules/event/model";

/**
 * Props для компонента MapMarker
 */
interface MapMarkerProps {
  /** Данные события для отображения на маркере */
  marker: IEvent;
  /** Callback функция, вызываемая при клике на кнопку "Подробнее" */
  onEventClick?: (marker: IEvent) => void;
  /** Текущая тема приложения (светлая/темная) */
  theme?: Theme;

  onClose?: () => void;
}

/**
 * Цветовые схемы для разных категорий событий
 */
const categoryColors = {
  music: "bg-purple-500",
  sports: "bg-green-500",
  art: "bg-pink-500",
  food: "bg-orange-500",
  science: "bg-blue-500",
  technology: "bg-indigo-500",
  other: "bg-gray-500",
} as const;

/**
 * Иконки для категорий событий
 */
const categoryIcons = {
  music: "🎵",
  sports: "⚽",
  art: "🎨",
  food: "🍽️",
  science: "🔬",
  technology: "💻",
  other: "📅",
} as const;

/**
 * Компонент карточки события для отображения в popup маркера на карте
 *
 * Отображает подробную информацию о событии в виде стильной карточки
 * в стиле современных приложений бронирования.
 *
 * @param props - Свойства компонента
 * @returns JSX элемент карточки события
 *
 * @example
 * ```tsx
 * <MapMarker
 *   marker={eventData}
 *   onEventClick={(event) => navigate(`/event/${event._id}`)}
 *   theme={currentTheme}
 * />
 * ```
 */
export function MapMarker({
  marker,
  onEventClick,
  theme,
  onClose,
}: MapMarkerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageNavigation = (direction: "prev" | "next") => {
    if (!marker.images || marker.images.length === 0) return;

    const imagesLength = marker.images.length;
    setCurrentImageIndex((prev) => {
      if (direction === "next") {
        return prev === imagesLength - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? imagesLength - 1 : prev - 1;
    });
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      }),
      time: marker.time ? marker.time : null,
    };
  };

  const eventDate = formatEventDate(marker.date);

  return (
    <div
      className={cn(
        theme === Theme.DARK
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Изображения события */}
      {marker.images && marker.images.length > 0 && (
        <div className="relative h-48 bg-gray-100">
          <img
            src={marker.images[currentImageIndex] ?? undefined}
            alt={marker.title}
            className="w-full h-full object-cover"
          />

          {/* Навигация по изображениям */}
          {marker.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => handleImageNavigation("prev")}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Предыдущее изображение"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => handleImageNavigation("next")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Следующее изображение"
              >
                →
              </button>

              {/* Индикаторы изображений */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {marker.images.map((imageId, index) => (
                  <button
                    key={imageId}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    )}
                    aria-label={`Перейти к изображению ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Кнопка закрытия */}
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Закрыть карточку события"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      )}

      {/* Контент карточки */}
      <div className="p-5">
        {/* Заголовок и категория */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1 mr-2">
            {marker.title}
          </h3>
          <span
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white",
              categoryColors[marker.category]
            )}
          >
            <span>{categoryIcons[marker.category]}</span>
            <span className="capitalize">{marker.category}</span>
          </span>
        </div>

        {/* Дата и время */}
        {eventDate && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-lg">📅</span>
            <span>{eventDate.date}</span>
            {eventDate.time && (
              <>
                <span>•</span>
                <span>{eventDate.time}</span>
              </>
            )}
          </div>
        )}

        {/* Описание */}
        {marker.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {marker.description}
          </p>
        )}

        {/* Количество участников */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-lg">👥</span>
          <span>{marker.attendeeCount} участников</span>
        </div>

        {/* Кнопка действия */}
        <button
          type="button"
          className={cn(
            "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200",
            "hover:scale-[1.02] active:scale-[0.98]",
            theme === Theme.DARK
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "bg-gray-900 text-white hover:bg-gray-800"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick?.(marker);
          }}
        >
          Подробнее о событии
        </button>
      </div>
    </div>
  );
}
