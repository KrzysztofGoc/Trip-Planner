import { API_URL } from "@/constants/apiUrl";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  date: string;
  description: string;
  image: string;
}

// Fetch all trips
export const fetchTrips = async (): Promise<Trip[]> => {
  const response = await fetch(`${API_URL}/trips`);
  if (!response.ok) throw new Error("Failed to fetch trips");
  return response.json();
};

// Fetch trip with specific id
export const fetchTrip = async (tripId: string | undefined): Promise<Trip> => {
  if (!tripId) throw new Error("Trip ID is missing");

  const response = await fetch(`${API_URL}/trips/${tripId}`);
  if (!response.ok) throw new Error(`Failed to fetch trip with id ${tripId}`);
  return response.json();
};