import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { addDoc, getDoc, doc, collection, serverTimestamp, getDocs, updateDoc, Timestamp } from "firebase/firestore";

export const fetchTrips = async (): Promise<Trip[]> => {
  const tripsRef = collection(db, "trips");
  const snapshot = await getDocs(tripsRef);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
      endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
    } as Trip;
  });
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

  const data = tripSnapshot.data();

  return {
    id: tripSnapshot.id,
    ...data,
    startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
    endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
  } as Trip;
};

// Create a new trip with a Firestore-generated ID
export const createTrip = async (): Promise<Trip> => {
  const tripData = {
    name: "",
    destination: "",
    startDate: null,
    endDate: null,
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

interface UpdateTripNameParams {
  tripId: string | undefined;
  name: string;
}

export async function updateTripName({ tripId, name, }: UpdateTripNameParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!name) throw new Error("Trip name is missing");

  const ref = doc(db, "trips", tripId);
  await updateDoc(ref, { name });
}

interface UpdateTripDestinationParams {
  tripId: string | undefined;
  destination: string;
}

export async function updateTripDestination({ tripId, destination, }: UpdateTripDestinationParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!destination) throw new Error("Trip destination is missing");

  const ref = doc(db, "trips", tripId);
  await updateDoc(ref, { destination });
}

type UpdateTripDateRangeParams = {
  tripId: string | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const updateTripDateRange = async ({ tripId, startDate, endDate }: UpdateTripDateRangeParams) => {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!startDate) throw new Error("Start date is missing");
  if (!endDate) throw new Error("End date is missing");

  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    updatedAt: new Date(),
  });
};
