import { API_URL } from "@/constants/apiUrl";
import { Trip } from "@/types/trip";

// Fetch all trips
export const fetchTrips = async (): Promise<Trip[]> => {
  const response = await fetch(`${API_URL}/trips`);
  if (!response.ok) throw new Error("Failed to fetch trips");
  return response.json();
};

interface FetchTripParams {
  signal?: AbortSignal;
  tripId: string | undefined;
}

// Fetch trip with specific id
export const fetchTrip = async ({ signal, tripId }: FetchTripParams): Promise<Trip> => {
  if (!tripId) throw new Error("Trip ID is missing");

  const response = await fetch(`${API_URL}/trips/${tripId}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch trip with id ${tripId}`);

  return response.json();
};