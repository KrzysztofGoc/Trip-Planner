import { API_URL } from "@/constants/apiUrl";
import { Place } from "@/types/place";

export const fetchPlaces = async (): Promise<Place[]> => {
    const response = await fetch(`${API_URL}/places`);
    if (!response.ok) throw new Error("Failed to fetch places");

    return response.json();
};