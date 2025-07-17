import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TripParticipantsList from "@/components/Trip/TripParticipantsList";
import TripTimeline from "@/components/Timeline/TripTimeline";
import TripNavigation from "@/components/Trip/TripNavigation/TripNavigation";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader/TripHeader";
import TripDateRange from "@/components/Trip/TripDateRange/TripDateRange";
import { useAuthStore } from "@/state/useAuthStore";
import { fetchTrip } from "@/api/trips";
import { fetchParticipants } from "@/api/participants";
import { fetchTripEvents } from "@/api/events";
import MapWidget from "@/components/Map/MapWidget";

export default function TripPage() {
    const { tripId } = useParams();

    const { data: tripData, isLoading: isLoadingTrip, isError: isErrorTrip, error: tripError } = useQuery({
        queryFn: () => fetchTrip({ tripId }),
        queryKey: ["trips", { tripId }],
    });

    const { data: participants, isLoading: isLoadingParticipants, isError: isErrorParticipants, error: participantsError } = useQuery({
        queryFn: () => fetchParticipants({ tripId }),
        queryKey: ["trips", { tripId }, "participants"],
    });

    const { data: events, isLoading: isLoadingEvents, isError: isErrorEvents, error: eventsError } = useQuery({
        queryFn: () => fetchTripEvents({ tripId }),
        queryKey: ["events", { tripId }],
        staleTime: 10000,
    });

    // Get current user from global store
    const currentUser = useAuthStore((state) => state.user);

    // Single source of truth for if current use is the owner
    const isOwner = tripData && currentUser
        ? tripData.ownerId === currentUser.uid
        : false;

    if (isErrorTrip || isErrorParticipants || isErrorEvents) return (
        <p>{tripError?.message || participantsError?.message || eventsError?.message}</p>
    );
    if (isLoadingTrip || isLoadingParticipants || isLoadingEvents) return (
        <p>Loading trip...</p>
    );
    if (!tripData) throw new Error("No trip found");
    if (!participants) throw new Error("No participants found");
    if (!events) throw new Error("No events found");

    return (
        <>
            <div className="size-auto flex flex-col pb-16">
                {/* Trip Top Navigation */}
                <TripNavigation mode="trip" isOwner={isOwner} tripId={tripId} participants={participants} ownerId={tripData.ownerId} />

                {/* Image Container */}
                <TripImage mode="trip" imageUrl={tripData.image} tripId={tripId} isOwner={isOwner} />

                {/* Trip Data Container */}
                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">

                    {/* Trip Header */}
                    <TripHeader
                        mode="trip"
                        name={tripData.name}
                        destination={tripData.destination}
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                        tripId={tripId}
                        isOwner={isOwner}
                    />

                    {/* Date Range */}
                    <TripDateRange
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                        tripId={tripId}
                        isOwner={isOwner}
                    />

                    {/* Participants and Hosted By */}
                    <TripParticipantsList
                        participants={participants}
                        ownerId={tripData.ownerId}
                        tripId={tripId}
                        isOwner={isOwner}
                    />

                    {/* Guard: Show map and timeline only if date range is set */}
                    {(!!tripData.startDate && !!tripData.endDate) ? (
                        <>
                            {/* Trip Map */}
                            <MapWidget mode="route" events={events} startDate={tripData.startDate} endDate={tripData.endDate} />

                            {/* Trip Timeline */}
                            <TripTimeline
                                startDate={tripData.startDate}
                                endDate={tripData.endDate}
                                tripId={tripId}
                                isOwner={isOwner}
                                events={events}
                            />
                        </>
                    ) : (
                        <div className="w-full text-center text-gray-500 text-base border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 mt-4">
                            <span className="block text-lg mb-2">Trip timeline and map</span>
                            will be shown when you select this trip's date range.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}