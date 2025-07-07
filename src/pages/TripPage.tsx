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
import { fetchParticipants } from "@/api/participants";

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

    // Get current user from global store
    const currentUser = useAuthStore((state) => state.user);

    // Single source of truth for if current use is the owner
    const isOwner = tripData && currentUser
        ? tripData.ownerId === currentUser.uid
        : false;

    if (isErrorTrip || isErrorParticipants) return (<p>{tripError?.message || participantsError?.message}</p>);
    if (isLoadingTrip || isLoadingParticipants) return (<p>Loading trip...</p>);
    if (!tripData) throw new Error("No trip found");
    if (!participants) throw new Error("No participants found");


    return (
        <>
            {tripData && (
                <div className="size-auto flex flex-col">
                    {/* Trip Top Navigation */}
                    <TripNavigation isOwner={isOwner} tripId={tripId} participants={participants} ownerId={tripData.ownerId} />

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