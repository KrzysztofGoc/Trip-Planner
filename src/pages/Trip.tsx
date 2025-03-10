import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import dayjs from 'dayjs';
import { MoveRight } from 'lucide-react';
import ParticipantsList from "@/components/ParticipantsList";
import TripTimeline from "@/components/TripTimeline";

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

    const startDate = dayjs(tripData?.date);
    const endDate = dayjs(tripData?.date).add(7, 'days');
    const formattedDate = startDate.isValid()
        ? `${startDate.format("MMMM D")} - ${endDate.format("MMMM D, YYYY")}`
        : "No Date Available";

    return (
        <>
            {tripData && (
                <div className="size-auto flex flex-col">
                    {/* Image Container */}
                    <div className="w-auto h-1/3">
                        <img className="object-cover size-full" src={tripData.image} />
                    </div>

                    {/* Trip Data Container */}
                    <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">

                        {/* Trip Header */}
                        <div className="size-auto">
                            <p className="text-sm text-gray-400">
                                {formattedDate}
                            </p>
                            <h1 className="text-3xl font-bold">{tripData.name}</h1>
                            <p className="text-gray-500">{tripData.destination}</p>

                        </div>

                        {/* Date Range */}
                        <div className="size-auto flex items-center justify-center border-1 border-gray-200 gap-4 p-6 rounded-xl shadow-md">

                            <div className="flex flex-col items-center">
                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                    From
                                </span>
                                <span className="text-lg font-semibold">
                                    {startDate.isValid() ? startDate.format("MMM D, YYYY") : "No Date Available"}
                                </span>
                            </div>

                            <MoveRight className="size-6 text-red-400 stroke-2" />

                            <div className="flex flex-col items-center">
                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                    To
                                </span>
                                <span className="text-lg font-semibold">
                                    {endDate.isValid() ? endDate.format("MMM D, YYYY") : "No Date Available"}
                                </span>
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="size-auto border-b-2 border-gray-200 pb-6">
                            <ParticipantsList participants={participants} />
                        </div>

                        {/* Trip Timeline */}
                        <div className="size-auto border-b-2 border-gray-200 pb-6">
                            <TripTimeline />
                        </div>

                        {/* Spacer (only for development) */}
                        <div className="h-96">

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}