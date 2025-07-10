import { Place } from "@/types/place";

export interface SearchPlacesParams {
    query: string;
    location: {
        lat: number;
        lng: number;
    };
}

export async function fetchPlaces({ query, location }: SearchPlacesParams): Promise<Place[]> {
    await google.maps.importLibrary('places');

    const request = {
        textQuery: query,
        locationBias: location,
        fields: ["id", "displayName", "location", "photos", "primaryTypeDisplayName", "formattedAddress"],
        maxResultCount: 20,
    };

    const { places } = await google.maps.places.Place.searchByText(request);

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

export const fetchPlaceSuggestions = async (query: string): Promise<string[]> => {
    if (!query) return [];

    const { AutocompleteSuggestion, AutocompleteSessionToken } =
        (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

    const sessionToken = new AutocompleteSessionToken();

    const request: google.maps.places.AutocompleteRequest = {
        input: query,
        includedPrimaryTypes: ["country", "locality"],
        sessionToken: sessionToken,
    };

    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    const mappedSuggestions = suggestions.map((s) => s.placePrediction?.text.text || "");

    return mappedSuggestions;
};