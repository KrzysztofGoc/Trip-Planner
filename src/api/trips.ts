import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { addDoc, getDoc, doc, collection, serverTimestamp, getDocs } from "firebase/firestore";

export const fetchTrips = async (): Promise<Trip[]> => {
  const tripsRef = collection(db, "trips");

  const snapshot = await getDocs(tripsRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Trip));
};

interface FetchTripParams {
  tripId: string | undefined;
}

// Fetch trip with specific id
export const fetchTrip = async ({ tripId }: FetchTripParams): Promise<Trip> => {
  if (!tripId) throw new Error("Trip ID is missing");

  const tripRef = doc(db, "trips", tripId);
  const tripSnapshot = await getDoc(tripRef);

  if (!tripSnapshot.exists()) {
    throw new Error(`Trip with ID "${tripId}" not found.`);
  }

  return {
    id: tripSnapshot.id,
    ...tripSnapshot.data(),
  } as Trip;
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