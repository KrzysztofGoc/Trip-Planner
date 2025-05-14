import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { addDoc, getDoc, doc, collection, serverTimestamp, getDocs, updateDoc } from "firebase/firestore";

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
export const createTrip = async (): Promise<Trip> => {
  const tripData = {
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    image: null,
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


interface UpdateTripImageParams {
  tripId: string | undefined;
  imageUrl: string | null;
}

export async function updateTripImage({ tripId, imageUrl, }: UpdateTripImageParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!imageUrl) throw new Error("Image URL is missing");

  const ref = doc(db, "trips", tripId);
  await updateDoc(ref, { image: imageUrl });
}

export interface UpdateTripNameParams {
  tripId: string | undefined;
  name: string;
}

export async function updateTripName({ tripId, name, }: UpdateTripNameParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!name) throw new Error("Trip name is missing");

  const ref = doc(db, "trips", tripId);
  await updateDoc(ref, { name });
}

export interface UpdateTripDestinationParams {
  tripId: string | undefined;
  destination: string;
}

export async function updateTripDestination({ tripId, destination, }: UpdateTripDestinationParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!destination) throw new Error("Trip destination is missing");

  const ref = doc(db, "trips", tripId);
  await updateDoc(ref, { destination });
}