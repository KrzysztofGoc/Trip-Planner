import { Place } from "@/types/place";

export interface SearchPlacesParams {
    query: string | undefined;
    location: {
        lat: number;
        lng: number;
    } | undefined;
    includedType: string | undefined;
}

export async function fetchPlaces({
    query,
    location,
    includedType,
}: SearchPlacesParams): Promise<Place[]> {
    if (!location) throw new Error("Location is required");

    await google.maps.importLibrary('places');

    let places: google.maps.places.Place[] = [];

    if (query) {
        const request = {
            textQuery: query,
            locationBias: location,
            includedType: includedType,
            fields: ["id", "displayName", "location", "photos", "primaryTypeDisplayName", "formattedAddress"],
            maxResultCount: 20,
            useStrictTypeFiltering: true,
        };

        places = (await google.maps.places.Place.searchByText(request)).places;
    } else {
        const request = {
            locationRestriction: { center: { ...location }, radius: 5000 },
            includedPrimaryTypes: includedType ? [includedType] : undefined,
            fields: ["id", "displayName", "location", "photos", "primaryTypeDisplayName", "formattedAddress"],
            maxResultCount: 20,
        }

        places = (await google.maps.places.Place.searchNearby(request)).places;
    }


    if (!places) return [];

    const returnedPlaces = places.map((place) => ({
        id: place.id,
        name: place.displayName ?? "Unknown Place",
        category: place.primaryTypeDisplayName ?? "other",
        img: place.photos?.[0]?.getURI() ?? "",
        address: place.formattedAddress ?? "Unknown address",
        lat: place.location?.lat ?? 0,
        lng: place.location?.lng ?? 0,
    })) as Place[];

    return returnedPlaces;
}

export const fetchPlace = async (placeId: string | undefined): Promise<Place> => {
    if (!placeId) throw new Error("Place ID is missing");

    await google.maps.importLibrary('places');

    const selectedPlace = new google.maps.places.Place({ id: placeId });

    const { place } = await selectedPlace.fetchFields({
        fields: ["id", "displayName", "location", "photos", "formattedAddress", "primaryTypeDisplayName"],
    });

    if (!place) {
        throw new Error(`Failed to fetch place with id ${placeId}`);
    }

    return {
        id: place.id,
        name: place.displayName ?? "Unknown Place",
        category: place.primaryTypeDisplayName ?? "other",
        img: place.photos?.[0]?.getURI() ?? "/place_default_image.png",
        address: place.formattedAddress ?? "Unknown address",
        lat: place.location?.lat() ?? 0,
        lng: place.location?.lng() ?? 0,
    };
};

export type PlaceSuggestion = {
    label: string;
    placeId: string;
};

export const fetchPlaceSuggestions = async (query: string): Promise<PlaceSuggestion[]> => {
    if (!query) return [];

    const { AutocompleteSuggestion, AutocompleteSessionToken } =
        (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

    const sessionToken = new AutocompleteSessionToken();

    const request: google.maps.places.AutocompleteRequest = {
        input: query,
        includedPrimaryTypes: ["country", "locality"],
        sessionToken,
    };

    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    return suggestions
        .map(s => {
            const label = s.placePrediction?.text.text;
            const placeId = s.placePrediction?.placeId;
            if (!label || !placeId) return null;
            return { label, placeId };
        })
        .filter((item): item is { label: string; placeId: string } => !!item);
};