import { useQuery } from "@tanstack/react-query";
import { fetchTrips } from "@/api/trips";
import TripCard from "./Trip/TripCard";

export default function TripsGrid() {
    const { data: trips, isLoading, isError, error } = useQuery({
        queryFn: fetchTrips,
        queryKey: ["trips"],
    });

    return (
        <>
            {isError && <p>{error.message}</p>}
            {isLoading && <p>Loading trips...</p>}
            {trips && (
                <div className="w-auto h-auto p-6">
                    <div className="w-auto min-h-screen grid grid-cols-1 gap-6 content-start">
                        {/* Trip Cards go there */}
                        {trips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}

                    </div>
                </div>
            )}
        </>
    );
}