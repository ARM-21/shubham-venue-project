"use client";

import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Tag,
  Shield,
  ChefHat,
  Palette,
  AlertCircle,
  UtensilsCrossed,
} from "lucide-react";

export default function ProfessionalEventDetails({ event, formatDateTime }) {
  if (!event) return null;

  // Calculate duration if both start and end times exist
  const calculateDuration = () => {
    if (!event.startDateTime || !event.endDateTime) return null;
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: diffHours, minutes: diffMins };
  };

  const duration = calculateDuration();

  // Check if event registration is open
  const isRegistrationOpen = () => {
    const now = new Date();
    const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
    const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

    if (!regStart || !regEnd) return null;
    if (now < regStart) return "upcoming"; // Registration not started
    if (now > regEnd) return "closed"; // Registration closed
    return "open"; // Registration open
  };

  const registrationStatus = isRegistrationOpen();

  return (
    <div className="space-y-8">
      {/* Event Category & Tags */}
      {(event.eventCategory || event.tags?.length > 0) && (
        <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-lg p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Tag size={20} className="text-amber-600" />
            {event.eventCategory && (
              <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold">
                {event.eventCategory.replace(/_/g, " ")}
              </span>
            )}
            {event.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event Timing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Date */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Calendar size={24} className="text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-600 font-medium">EVENT DATE</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {event.eventDate
                  ? new Intl.DateTimeFormat("en-GB", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(event.eventDate))
                  : "Date not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Event Duration */}
        {duration && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Clock size={24} className="text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-green-600 font-medium">DURATION</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {duration.hours > 0 && `${duration.hours}h `}
                  {duration.minutes}m
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {formatDateTime(event.startDateTime)} - {formatDateTime(event.endDateTime)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registration Period */}
      {(event.registrationStartDate || event.registrationEndDate) && (
        <div
          className={`border-l-4 p-6 rounded-lg ${
            registrationStatus === "open"
              ? "bg-emerald-50 border-emerald-500"
              : registrationStatus === "upcoming"
              ? "bg-blue-50 border-blue-500"
              : "bg-gray-50 border-gray-500"
          }`}
        >
          <div className="flex items-start gap-4">
            <AlertCircle
              size={24}
              className={`flex-shrink-0 mt-1 ${
                registrationStatus === "open"
                  ? "text-emerald-600"
                  : registrationStatus === "upcoming"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Registration Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Registration Opens</p>
                  <p className="font-medium text-gray-900">
                    {event.registrationStartDate
                      ? new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }).format(new Date(event.registrationStartDate))
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Registration Closes</p>
                  <p className="font-medium text-gray-900">
                    {event.registrationEndDate
                      ? new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }).format(new Date(event.registrationEndDate))
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={`font-medium ${
                      registrationStatus === "open"
                        ? "text-emerald-700"
                        : registrationStatus === "upcoming"
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {registrationStatus === "open"
                      ? "Open Now"
                      : registrationStatus === "upcoming"
                      ? "Coming Soon"
                      : "Closed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Information */}
      {(event.maxAttendees ||
        event.expectedAttendees ||
        event.targetAudience ||
        event.ageRestriction ||
        event.dressCode) && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-amber-600" />
            Attendance & Audience
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.maxAttendees && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Max Attendees</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{event.maxAttendees}</p>
              </div>
            )}
            {event.expectedAttendees && (
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                <p className="text-sm text-pink-600 font-medium">Expected Attendees</p>
                <p className="text-2xl font-bold text-pink-900 mt-1">{event.expectedAttendees}</p>
              </div>
            )}
            {event.targetAudience && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 font-medium">Target Audience</p>
                <p className="text-gray-900 mt-1">{event.targetAudience}</p>
              </div>
            )}
            {event.dressCode && (
              <div>
                <p className="text-sm text-gray-600 font-medium">Dress Code</p>
                <p className="text-gray-900 mt-1 capitalize">
                  {event.dressCode.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {event.ageRestriction && (
              <div>
                <p className="text-sm text-gray-600 font-medium">Age Restriction</p>
                <p className="text-gray-900 mt-1">{event.ageRestriction}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services & Requirements */}
      {(event.catering || event.decoration || event.specialRequirements) && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-amber-600" />
            Services & Special Requirements
          </h4>
          <div className="space-y-3">
            {event.catering && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <ChefHat size={20} className="text-emerald-600" />
                <span className="text-emerald-900 font-medium">Catering Included</span>
              </div>
            )}
            {event.decoration && (
              <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <Palette size={20} className="text-rose-600" />
                <span className="text-rose-900 font-medium">Decoration Services Available</span>
              </div>
            )}
            {event.specialRequirements && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium mb-1">Special Requirements</p>
                <p className="text-amber-900 text-sm">{event.specialRequirements}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Information */}
      {(event.location?.city ||
        event.location?.state ||
        event.location?.country) && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-indigo-600" />
            Location Details
          </h4>
          <div className="space-y-2 text-indigo-900">
            {event.location?.city && <p>• {event.location.city}</p>}
            {event.location?.state && <p>• {event.location.state}</p>}
            {event.location?.country && <p>• {event.location.country}</p>}
          </div>
        </div>
      )}

      {/* Event Privacy */}
      {event.isPublic !== undefined && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <Shield size={20} className={event.isPublic ? "text-green-600" : "text-orange-600"} />
          <div>
            <p className="font-medium text-gray-900">
              {event.isPublic ? "Public Event" : "Private Event"}
            </p>
            <p className="text-sm text-gray-600">
              {event.isPublic
                ? "Anyone can view and register"
                : `Access code required: ${event.accessCode || "Not set"}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
