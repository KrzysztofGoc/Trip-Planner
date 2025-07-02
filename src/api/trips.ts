import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { addDoc, getDoc, doc, collection, serverTimestamp, getDocs, updateDoc, Timestamp, where, query, or, writeBatch } from "firebase/firestore";
import { httpsCallable } from "firebase/functions"
import { functions, auth } from "../firebase"
import { signInWithEmailAndPassword } from "firebase/auth";

export const fetchTrips = async (uid: string): Promise<Trip[]> => {
  // Fetch trips where the user is either the owner or a participant
  const tripsRef = collection(db, "trips");

  // Query for trips where the user is either the owner or a participant
  const q = query(
    tripsRef,
    or(
      where("ownerId", "==", uid), // Filter by ownerId
      where("participants", "array-contains", uid) // Filter by participants array
    )
  );

  const snapshot = await getDocs(q);

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
export const createTrip = async (): Promise<string> => {
  // Get the currently authenticated user (whether logged in or anonymous)
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be logged in (either authenticated or anonymous) to create a trip.");
  }

  // Set the trip data
  const tripData = {
    name: null,
    destination: null,
    startDate: null,
    endDate: null,
    description: null,
    image: null,
    participants: [],
    events: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ownerId: user.uid, // Use the Firebase user UID (whether authenticated or anonymous)
  };

  // Create a new trip document in the 'trips' collection
  const docRef = await addDoc(collection(db, "trips"), tripData);

  return docRef.id;
};


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
};

export const updateTripDateRange = async ({ tripId, startDate, endDate, }: UpdateTripDateRangeParams) => {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!startDate) throw new Error("Start date is missing");
  if (!endDate) throw new Error("End date is missing");

  const fn = httpsCallable(functions, "updateTripDateRange");

  await fn({
    tripId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
};

type transferTripOwnershipProps = {
  login: string,
  password: string,
}

// Function to update ownerId in all trips created by the anonymous user
export const loginAndTransferTripOwnership = async ({ login, password }: transferTripOwnershipProps) => {
  const oldUid = auth.currentUser?.uid;

  try {
    await signInWithEmailAndPassword(auth, login, password);
  } catch (err) {
    throw new Error("Failed to login" + err);
  }

  const newUid = auth.currentUser?.uid;

  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, where("ownerId", "==", oldUid));

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.forEach(docSnap => {
    const tripRef = doc(db, "trips", docSnap.id);
    batch.update(tripRef, { ownerId: newUid });
  });

  await batch.commit(); // Commit the batch to update all trips
};