import TripNavigation from "@/components/Trip/TripNavigation";
import Map from "@/components/Map/Map";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import { Trip } from "@/types/trip";

export default function FullMapPage() {
    const { tripId } = useParams();
    const [searchParams] = useSearchParams();
    const dayParam = searchParams.get("day");

    const { data: tripData, isLoading, isError, error, } = useQuery<Trip>({
        queryKey: ["trip", tripId],
        queryFn: ({ signal }) => fetchTrip({ signal, tripId }),
    });

    if (isLoading) return <p>Loading trip...</p>;
    if (isError) return <p>{error?.message}</p>;
    if (!tripData) return <p>No trip found</p>;

    let events = tripData.events;

    if (dayParam) {
        events = events.filter((event) => event.dayNumber === Number(dayParam))
    }

    return (
        <div className="w-screen h-screen flex flex-col">
            <TripNavigation />
            <Map
                mode="route"
                events={events}
            />
        </div>
    );
}
