import { API_URL } from "@/constants/apiUrl";
import { Place } from "@/types/place";

export const fetchPlaces = async (): Promise<Place[]> => {
    const response = await fetch(`${API_URL}/places`);
    if (!response.ok) throw new Error("Failed to fetch places");

    return response.json();
};

// Fetch place by ID
export const fetchPlaceById = async (placeId: string | undefined): Promise<Place> => {
    if (!placeId) throw new Error("Place ID is missing");

    const response = await fetch(`${API_URL}/places/${placeId}`);
    if (!response.ok) throw new Error(`Failed to fetch place with id ${placeId}`);

    return response.json();
}