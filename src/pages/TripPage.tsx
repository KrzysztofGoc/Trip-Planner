import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TripParticipantsList from "@/components/Trip/TripParticipants/TripParticipantsList";
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
import UniversalLoader from "@/components/LoadingSpinner";

export default function TripPage() {
    const { tripId } = useParams();

    const { data: tripData, isLoading: isLoadingTrip } = useQuery({
        queryFn: () => fetchTrip({ tripId }),
        queryKey: ["trips", { tripId }],
        throwOnError: true,
    });

    const { data: participants, isLoading: isLoadingParticipants } = useQuery({
        queryFn: () => fetchParticipants({ tripId }),
        queryKey: ["trips", { tripId }, "participants"],
        throwOnError: true,
    });

    const { data: events, isLoading: isLoadingEvents } = useQuery({
        queryFn: () => fetchTripEvents({ tripId }),
        queryKey: ["events", { tripId }],
        staleTime: 10000,
        throwOnError: true,
    });

    // Get current user from global store
    const currentUser = useAuthStore((state) => state.user);

    // Single source of truth for if current user is the owner
    const isOwner = tripData && currentUser
        ? tripData.ownerId === currentUser.uid
        : false;

    if (isLoadingTrip || isLoadingParticipants || isLoadingEvents) {
        return <UniversalLoader label="Loading trip..." fullscreen />;
    }
    if (!tripData) throw new Error("No trip found");
    if (!participants) throw new Error("No participants found");
    if (!events) throw new Error("No events found");

    return (
        // Set background to white for the whole page
        <div 
        className="min-h-screen bg-white w-full mx-auto max-w-screen-xl flex flex-col items-center md:px-10 md:pt-6 lg:px-20"
        >
            {/* Main content is centered, not full width on desktop */}
            <div className="relative w-full flex flex-col">
                {/* Top nav */}
                <TripNavigation
                    mode="trip"
                    isOwner={isOwner}
                    tripId={tripId}
                    participants={participants}
                    ownerId={tripData.ownerId}
                />

                {/* Image */}
                <TripImage
                    mode="trip"
                    imageUrl={tripData.image}
                    tripId={tripId}
                    isOwner={isOwner}
                />

                {/* Main content */}
                <div className="flex flex-col gap-6 py-6 w-full px-6 md:px-0">
                    <TripHeader
                        mode="trip"
                        name={tripData.name}
                        destination={tripData.destination}
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                        tripId={tripId}
                        isOwner={isOwner}
                    />

                    <TripDateRange
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                        tripId={tripId}
                        isOwner={isOwner}
                    />

                    <TripParticipantsList
                        participants={participants}
                        ownerId={tripData.ownerId}
                        tripId={tripId}
                        isOwner={isOwner}
                    />

                    {(!!tripData.startDate && !!tripData.endDate) ? (
                        <>
                            <MapWidget
                                mode="route"
                                events={events}
                                startDate={tripData.startDate}
                                endDate={tripData.endDate}
                            />

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
        </div>
    );
}
