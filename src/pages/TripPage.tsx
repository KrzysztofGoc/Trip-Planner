import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import TripParticipantsList from "@/components/Trip/TripParticipantsList";
import TripTimeline from "@/components/Timeline/TripTimeline";
import TripNavigation from "@/components/Trip/TripNavigation/TripNavigation";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader/TripHeader";
import TripDateRange from "@/components/Trip/TripDateRange/TripDateRange";
import { useAuthStore } from "@/state/useAuthStore";

export default function TripPage() {
    const { tripId } = useParams();
    const { data: tripData, isLoading, isError, error } = useQuery({
        queryFn: () => fetchTrip({ tripId }),
        queryKey: ["trips", { tripId: tripId }],
    });

    // Get current user from global store
    const currentUser = useAuthStore((state) => state.user);

    // Single source of truth for if current use is the owner
    const isOwner = tripData && currentUser
        ? tripData.ownerId === currentUser.uid
        : false;

    if (isError) {
        return (<p>{error.message}</p>);
    }

    if (isLoading) {
        return (<p>Loading trip...</p>);
    }

    return (
        <>
            {tripData && (
                <div className="size-auto flex flex-col">
                    {/* Trip Top Navigation */}
                    <TripNavigation isOwner={isOwner} tripId={tripId} />

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
                            participants={tripData.participants}
                            ownerId={tripData.ownerId}
                            tripId={tripId}
                            isOwner={isOwner}
                        />

                        {/* Trip Timeline */}
                        <TripTimeline
                            startDate={tripData.startDate}
                            endDate={tripData.endDate}
                            tripId={tripId}
                            isOwner={isOwner}
                        />
                    </div>
                </div>
            )}

        </>
    );
}