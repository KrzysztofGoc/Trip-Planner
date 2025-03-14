import EventCard from "./EventCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces } from "@/api/places";

export default function EventsGrid() {
    const { data: places, isLoading, isError, error } = useQuery({
        queryKey: ["places"],
        queryFn: fetchPlaces,
    });

    return (
        <>
            {isError && <p>{error.message}</p>}
            {isLoading && <p>Loading places...</p>}
            {places && (
                <div className="w-auto h-auto p-6">
                    <div className="w-auto min-h-screen grid grid-cols-1 gap-6 content-start">
                        {places.length > 0 ? (
                            places.map((place) => (
                                <EventCard key={place.id} event={place} />
                            ))
                        ) : (
                            <p>No places available.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
