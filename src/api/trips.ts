import { API_URL } from "@/constants/apiUrl";
import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";


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

// Create a new trip with a Firestore-generated ID
export async function createTrip(): Promise<Trip> {
  const tripData = {
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    image: "",
    participants: [],
    events: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  
  const docRef = await addDoc(collection(db, "trips"), tripData);

  return {
    id: docRef.id,
    ...tripData,
  } as Trip;
}