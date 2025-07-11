import PlaceCard from "../PlaceCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces } from "@/api/places";
import { fetchTrip } from "@/api/trips";
import { useParams, useNavigate } from "react-router-dom";

interface PlacesGridProps {
    category: string | undefined; // This is the Google type string (e.g. "restaurant")
    search: string;
}

export default function PlacesGrid({ search, category }: PlacesGridProps) {
    const navigate = useNavigate();
    const { tripId, dayNumber } = useParams();

    // Fetch trip data to get destination location
    const { data: tripData, isLoading: isTripLoading, isError: isTripError, error: tripError } = useQuery({
        queryKey: ["trip", tripId],
        queryFn: () => fetchTrip({ tripId }),
    });

    const location =
        tripData?.destinationLat && tripData?.destinationLng
            ? { lat: tripData.destinationLat, lng: tripData.destinationLng }
            : undefined;

    const { data: places, isLoading: isPlacesLoading, isError: isPlacesError, error: placesError } = useQuery({
        queryKey: ["places", search, category, location],
        queryFn: () => fetchPlaces({
            query: search || undefined,
            location: location,
            includedType: category,
        }),
        enabled: !!location && (!!search || !!category),
    });

    function handlePlaceClick(placeId: string) {
        navigate(`/trips/${tripId}/${dayNumber}/add/${placeId}`)
    }

    /// Handle trip loading and error
    if (isTripLoading) {
        return <div className="p-6">Loading trip info…</div>;
    }
    if (isTripError) {
        return <div className="p-6 text-red-500">{tripError instanceof Error ? tripError.message : "Error loading trip"}</div>;
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
    if (isPlacesError) {
        return <div className="p-6 text-red-500">{placesError instanceof Error ? placesError.message : "Error loading places"}</div>;
    }

    return (
        <div className="w-auto h-auto p-6">
            <div className="w-auto min-h-screen grid grid-cols-1 gap-6 content-start">
                {places && places.length > 0 ? (
                    places.map((place) => (
                        <PlaceCard
                            onClick={() => handlePlaceClick(place.id)}
                            key={place.id}
                            event={place}
                        />
                    ))
                ) : (
                    <p>Select category or type in search bar to see available places.</p>
                )}
            </div>
        </div>
    );
}
