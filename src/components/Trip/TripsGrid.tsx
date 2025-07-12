import { useQuery } from "@tanstack/react-query";
import { fetchTrips } from "@/api/trips";
import TripCard from "./TripCard";
import { useAuthStore } from "@/state/useAuthStore";
import { Trip } from "@/types/trip";

interface TripsGridProps {
    search: string;
}

export default function TripsGrid({ search }: TripsGridProps) {
    const user = useAuthStore(s => s.user);

    const { data: trips, isLoading, isError, error } = useQuery({
        queryFn: () => fetchTrips(user?.uid || ""),
        queryKey: ["trips", user?.uid],
    });

    let filteredTrips: Trip[] = [];

    if (trips) {
        const query = search?.toLowerCase() || null;
        filteredTrips = query ? trips.filter(trip =>
            (trip.name?.toLowerCase().includes(query) || false) ||
            (trip.destination?.toLowerCase().includes(query) || false))
            :
            trips
    }

    return (
        <>
            {isError && <p>{error.message}</p>}
            {isLoading && <p>Loading trips...</p>}
            {filteredTrips && (
                <div className="w-auto h-auto p-6">
                    <div className="w-auto min-h-screen grid grid-cols-1 gap-6 content-start">
                        {filteredTrips.length > 0 ? (
                            filteredTrips.map(trip => (
                                <TripCard key={trip.id} trip={trip} />
                            ))
                        ) : (
                            <p>No trips found.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}