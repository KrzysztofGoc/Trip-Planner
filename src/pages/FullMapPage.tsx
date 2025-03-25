import TripNavigation from "@/components/Trip/TripNavigation";
import { useParams } from "react-router-dom";
import Map from "@/components/Map";
import { useQuery } from "@tanstack/react-query";
import { fetchPlace } from "@/api/places";

export default function FullMapPage() {
    const { tripId } = useParams();

    const { data } = useQuery({
        queryKey: ['place', tripId],
        queryFn: () => fetchPlace(tripId),
    });

    if (!data) {
        return <p>Error</p>
    }

    return (
        <div className="size-auto flex flex-col">
            <TripNavigation />
            <Map mode="place" place={data} />
        </div>
    );
}