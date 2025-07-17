import PlaceCard from "../PlaceCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces } from "@/api/places";
import { fetchTrip } from "@/api/trips";
import { useParams, useNavigate } from "react-router-dom";

interface PlacesGridProps {
    category: string | undefined;
    search: string;
}

export default function PlacesGrid({ search, category }: PlacesGridProps) {
    const navigate = useNavigate();
    const { tripId, dayNumber } = useParams();

    // Fetch trip data to get destination location
    const { data: tripData, isLoading: isTripLoading} = useQuery({
        queryKey: ["trip", tripId],
        queryFn: () => fetchTrip({ tripId }),
        throwOnError: true,
    });

    const location =
        tripData?.destinationLat && tripData?.destinationLng
            ? { lat: tripData.destinationLat, lng: tripData.destinationLng }
            : undefined;

    const { data: places, isLoading: isPlacesLoading } = useQuery({
        queryKey: ["places", search, category, location],
        queryFn: () => fetchPlaces({
            query: search || undefined,
            location: location,
            includedType: category,
        }),
        enabled: !!location && (!!search || !!category),
        throwOnError: true,
    });

    function handlePlaceClick(placeId: string) {
        navigate(`/trips/${tripId}/${dayNumber}/add/${placeId}`)
    }

    /// Handle trip loading and error
    if (isTripLoading) {
        return <div className="p-6">Loading trip info…</div>;
    }
    if (!location) {
        return (
            <div className="p-6 text-red-500">
                Trip does not have a destination location. Go back and set a destination first.
            </div>
        );
    }

    // Handle places loading and error
    if (isPlacesLoading) {
        return <div className="p-6">Loading places…</div>;
    }

    return (
        <div className="w-auto h-auto p-6">
            <div className="w-auto h-auto grid grid-cols-1 gap-6 content-start">
                {/* Case 1: Places are truthy and there are results */}
                {places && places.length > 0 ? (
                    places.map((place) => (
                        <PlaceCard
                            onClick={() => handlePlaceClick(place.id)}
                            event={place}
                        />
                    ))
                ) :
                    // Case 2: Places are truthy but empty
                    places && places.length === 0 ? (
                        <p className="text-center text-gray-500">No places found for this category. Try adjusting the category or search term.</p>
                    ) :
                        // Case 3: Places are falsy (query is not enabled)
                        (
                            <p className="text-center text-gray-500">Select category or type in search bar to see available places.</p>
                        )}
            </div>
        </div>
    );
}
