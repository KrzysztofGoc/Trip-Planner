import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import dayjs from 'dayjs';
import TripParticipantsList from "@/components/Trip/TripParticipantsList";
import TripTimeline from "@/components/Timeline/TripTimeline";
import TripNavigation from "@/components/Trip/TripNavigation";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader";
import TripDateRange from "@/components/Trip/TripDateRange";

export default function TripPage() {
    const { tripId } = useParams();
    const { data: tripData, isLoading, isError, error } = useQuery({
        queryFn: () => fetchTrip({ tripId }),
        queryKey: ["trips", { tripId: tripId }],
    });

    if (isError) {
        return (<p>{error.message}</p>);
    }

    if (isLoading) {
        return (<p>Loading trip...</p>);
    }

    const startDate = dayjs(tripData?.startDate).format("MMM D, YYYY");
    const endDate = dayjs(tripData?.endDate).format("MMM D, YYYY");


    return (
        <>
            {tripData && (
                <div className="size-auto flex flex-col">
                    {/* Trip Top Navigation */}
                    <TripNavigation />

                    {/* Image Container */}
                    <TripImage imageUrl={tripData.image} tripId={tripId} />

                    {/* Trip Data Container */}
                    <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">

                        {/* Trip Header */}
                        <TripHeader
                            name={tripData.name}
                            destination={tripData.destination}
                            formattedDate={`${startDate} - ${endDate}`}
                        />

                        {/* Date Range */}
                        <TripDateRange startDate={startDate} endDate={endDate} />

                        {/* Participants and Hosted By */}
                        <TripParticipantsList participants={tripData.participants} />

                        {/* Trip Timeline */}
                        <TripTimeline startDate={startDate} endDate={endDate} tripId={tripId} />
                    </div>
                </div>
            )}

        </>
    );
}