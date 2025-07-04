import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { addDoc, getDoc, doc, collection, serverTimestamp, getDocs, updateDoc, Timestamp, where, query, or, arrayRemove, arrayUnion } from "firebase/firestore";
import { httpsCallable } from "firebase/functions"
import { functions, auth } from "../firebase"
import { Participant } from "@/types/participant";

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

type AddParticipantToTripParams = {
  tripId: string | undefined;
  participant: Participant;
};

/**
 * Add a participant to the trip's participants array in Firestore.
 * 
 * @param tripId - The Firestore ID of the trip
 * @param participant - The participant to add (uid, displayName, photoURL)
 */
export async function addParticipantToTrip({ tripId, participant }: AddParticipantToTripParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!participant?.uid) throw new Error("Participant UID is missing");

  const tripRef = doc(db, "trips", tripId);
  const tripSnap = await getDoc(tripRef);

  if (!tripSnap.exists()) {
    throw new Error("Trip does not exist");
  }

  // Return early in participant already in the trip
  const participants: Participant[] = tripSnap.data().participants ?? [];
  if (participants.some((p) => p.uid === participant.uid)) {
    throw new Error("Participant already added to the trip");
  }

  await updateDoc(tripRef, {
    participants: arrayUnion(participant),
  });
}

type RemoveParticipantFromTripParams = {
  tripId: string | undefined;
  uid: string;
};

/**
 * Remove a participant from the trip's participants array in Firestore.
 * 
 * @param tripId - The Firestore ID of the trip
 * @param uid - The UID of the participant to remove
 */
export async function removeParticipantFromTrip({ tripId, uid }: RemoveParticipantFromTripParams): Promise<void> {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!uid) throw new Error("Participant UID is missing");

  const tripRef = doc(db, "trips", tripId);

  // Fetch the trip document to get the current participants array
  const tripSnap = await getDoc(tripRef);

  // Throw if trip does not exist
  if (!tripSnap.exists()) {
    throw new Error("Trip does not exist");
  }

  // Get current participants array
  const existing: Participant[] = tripSnap.data().participants ?? [];

  // Find the participant object by UID
  const participantObj = existing.find((p) => p.uid === uid);

  // Throw if participant not found
  if (!participantObj) {
    throw new Error("Participant not found in this trip");
  }

  // Remove the participant from Firestore array
  await updateDoc(tripRef, {
    participants: arrayRemove(participantObj),
  });
}