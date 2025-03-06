import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import dayjs from 'dayjs';

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

    return (
        <>
            {tripData && (
                <div className="w-auto h-screen flex flex-col">
                    <div className="w-auto h-1/3">
                        <img className="object-cover size-full" src={tripData.image} />
                    </div>
                    <div className="w-auto h-2/3 flex flex-col px-6 pt-6">
                        <div>
                            <h1 className="text-3xl font-bold">{tripData.name}</h1>
                            <p className="text-gray-500">{tripData.destination}</p>
                            <p className="text-sm text-gray-400">
                                {startDate.isValid()
                                    ? `${startDate.format("MMMM D")} - ${startDate.add(7, 'days').format("MMMM D, YYYY")}`
                                    : "No Date Available"}
                            </p>


                            {/* Description */}
                            <div className="max-w-2xl text-lg mt-4">
                                {tripData.description}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}