import PlaceCard from "../PlaceCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces } from "@/api/places";
import { useParams, useNavigate } from "react-router-dom";

export default function PlacesGrid() {
    const navigate = useNavigate();
    const { tripId, dayId } = useParams();
    const { data: places, isLoading, isError, error } = useQuery({
        queryKey: ["places"],
        queryFn: fetchPlaces,
    });

    function handlePlaceClick(placeId: string) {
        navigate(`/trips/${tripId}/${dayId}/add/${placeId}`)
    }

    return (
        <>
            {isError && <p>{error.message}</p>}
            {isLoading && <p>Loading places...</p>}
            {places && (
                <div className="w-auto h-auto p-6">
                    <div className="w-auto min-h-screen grid grid-cols-1 gap-6 content-start">
                        {places.length > 0 ? (
                            places.map((place) => (
                                <PlaceCard onClick={() => handlePlaceClick(place.id)} key={place.id} event={place} />
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
