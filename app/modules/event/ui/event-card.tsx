import { useState } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "convex/_generated/api";
import type { IEvent } from "../model";
import { Badge } from "~/shared/ui/badge";

interface EventCardProps {
  event: IEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const isAttending = useQuery(api.events.isAttending, { eventId: event._id });

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? event.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === event.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleCardClick = () => {
    navigate(`/event/${event._id}`);
  };

  const currentImage = event.images[currentImageIndex];
  const hasMultipleImages = event.images.length > 1;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]">
      <button
        type="button"
        onClick={handleCardClick}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className="w-full text-left"
      >
        {/* Image Gallery */}
        <div className="aspect-[4/3] bg-gray-100 relative group">
          {currentImage ? (
            <img
              src={currentImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <title>Event image</title>
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePreviousImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Previous image</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Next image</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
              {event.images.map((image, index) => (
                <button
                  key={`card-${image}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
            {event.title}
          </h3>

          <div className="space-y-1 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <title>Date</title>
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {event.date} at {event.time}
            </div>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <title>Address</title>
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="line-clamp-1">{event.address.formatted}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {event.attendeeCount} участников
            </span>
            {isAttending && (
              <Badge className="px-3 py-1 rounded-full text-xs font-medium transition-colors bg-gray-900 text-white hover:bg-gray-900/80">
                Иду
              </Badge>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
