import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import dayjs from 'dayjs';
import { MoveRight } from 'lucide-react';
import ParticipantsList from "@/components/ParticipantsList";
import TripTimeline from "@/components/Timeline/TripTimeline";
import TripNavigation from "@/components/TripNavigation";
import TripImage from "@/components/TripImage";
import TripHeader from "@/components/TripHeader";
import TripDateRange from "@/components/TripDateRange";

const participants = [
    { id: 1, name: "Alice", image: "https://github.com/shadcn.png" },
    { id: 2, name: "Bob", image: "https://github.com/shadcn.png" },
    { id: 3, name: "Charlie", image: "https://github.com/shadcn.png" },
    { id: 4, name: "David", image: "https://github.com/shadcn.png" },
    { id: 5, name: "Eve", image: "https://github.com/shadcn.png" }
];

export default function TripPage() {
    const { tripId } = useParams();
    const { data: tripData, isLoading, isError, error } = useQuery({
        queryFn: () => fetchTrip(tripId),
        queryKey: ["trips", { tripId: tripId }],
    });

    if (isError) {
        return (<p>{error.message}</p>);
    }

    if (isLoading) {
        return (<p>Loading trip...</p>);
    }

    const startDate = dayjs(tripData?.date).format("MMM D, YYYY");
    const endDate = dayjs(tripData?.date).add(7, "days").format("MMM D, YYYY");

    return (
        <>
            {tripData && (
                <div className="size-auto flex flex-col">
                    {/* Trip Top Navigation */}
                    <TripNavigation />

                    {/* Image Container */}
                    <TripImage imageUrl={tripData.image} />

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
                        <ParticipantsList participants={participants} />

                        {/* Trip Timeline */}
                        <TripTimeline />
                    </div>
                </div>
            )}
        </>
    );
}