import { useQuery } from "@tanstack/react-query";
import { fetchTrips } from "@/api/trips";
import TripCard from "./TripCard";

export default function TripsGrid() {
    const { data: trips, isLoading, isError, error } = useQuery({
        queryFn: fetchTrips,
        queryKey: ["trips"],
    });

    return (
        <>
            {isError && <p>{error.message}</p>}
            {isLoading && <p>Loading trips...</p>}
            {(!isError && !isLoading && trips) && (
                <div className="w-auto h-auto mt-6 px-6">
                    <div className="w-auto h-screen grid grid-cols-1 gap-6">
                        {/* Trip Cards go there */}
                        {trips.map((trip) => (
                            <TripCard trip={trip} />
                        ))}

                    </div>
                </div>
            )}
        </>
    );
}