import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { IEvent } from "../model";

interface EventCardProps {
  event: IEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleAttendance = useMutation(api.events.toggleAttendance);
  const isAttending = useQuery(api.events.isAttending, { eventId: event._id });

  const handleAttendanceToggle = async () => {
    try {
      await toggleAttendance({ eventId: event._id });
    } catch (error) {
      console.error("Failed to toggle attendance:", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div
          onClick={() => setShowDetails(true)}
          onKeyUp={() => setShowDetails(true)}
        >
          {/* Image */}
          <div className="aspect-[4/3] bg-gray-100 relative">
            {event.titleImage ? (
              <img
                src={event.titleImage}
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
            <div className="absolute top-3 left-3">
              <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                {event.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {event.title}
            </h3>

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
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
                  className="w-4 h-4 mr-2"
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
              <span className="text-sm text-gray-500">
                {event.attendeeCount} attending
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttendanceToggle();
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isAttending
                    ? "bg-rose-100 text-rose-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isAttending ? "Going" : "Interested"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Image */}
              <div className="aspect-[2/1] bg-gray-100">
                {event.titleImage ? (
                  <img
                    src={event.titleImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
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
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
                      {event.title}
                    </h2>
                    <p className="text-gray-600">
                      Organized by{" "}
                      {event?.organizer?.name ||
                        event.organizer?.email ||
                        "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">When</h3>
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 mr-2"
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
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Where</h3>
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 mr-2"
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
                      {event.address.formatted}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-600">
                    {event.attendeeCount} people attending
                  </span>
                  <button
                    type="button"
                    onClick={handleAttendanceToggle}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      isAttending
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        : "bg-rose-500 text-white hover:bg-rose-600"
                    }`}
                  >
                    {isAttending ? "Cancel" : "I'm Going"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
