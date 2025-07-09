import { Trip } from "@/types/trip";
import { db } from "@/firebase";
import { getDoc, doc, collection, serverTimestamp, getDocs, updateDoc, Timestamp, where, query, deleteDoc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions"
import { functions, auth } from "../firebase"
import { Participant } from "@/types/participant";

// Utility to convert Firestore Timestamp to Date, handling nulls and Dates
export const fetchTrips = async (uid: string): Promise<Trip[]> => {
  if (!uid) return [];

  // 1. Get all userTrip documents for this user
  const userTripsSnap = await getDocs(collection(db, "userTrips", uid, "trips"));

  const tripIds = userTripsSnap.docs.map(doc => doc.id);

  if (tripIds.length === 0) return [];

  // Split into chunks of 10 (safe for Firestore 'in' queries)
  const chunkSize = 10;
  const chunks: string[][] = [];
  for (let i = 0; i < tripIds.length; i += chunkSize) {
    chunks.push(tripIds.slice(i, i + chunkSize));
  }

  let trips: Trip[] = [];

  for (const chunk of chunks) {
    const tripsSnap = await getDocs(
      query(
        collection(db, "trips"),
        where("__name__", "in", chunk)
      )
    );
    trips = trips.concat(
      tripsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Trip;
      })
    );
  }

  return trips;
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

export const createTrip = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to create a trip.");

  // 1. Generate a new trip document reference
  const tripRef = doc(collection(db, "trips"));

  // 2. Prepare trip data
  const tripData = {
    name: null,
    destination: null,
    startDate: null,
    endDate: null,
    description: null,
    image: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ownerId: user.uid,
  };

  // Create trip first
  await setDoc(tripRef, tripData);

  // Now, create the participant doc for the owner
  const participantDoc = {
    uid: user.uid,
    displayName: user.displayName || "Trip owner",
    photoURL: user.photoURL || null,
  };
  const participantRef = doc(tripRef, "participants", user.uid);
  await setDoc(participantRef, participantDoc);

  return tripRef.id;
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

  // Document at /trips/{tripId}/participants/{uid}
  const participantRef = doc(db, "trips", tripId, "participants", participant.uid);
  await setDoc(participantRef, participant);
}


type RemoveParticipantFromTripParams = {
  tripId: string | undefined;
  uid: string | undefined | null;
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

  const participantRef = doc(db, "trips", tripId, "participants", uid);
  await deleteDoc(participantRef);
}

type deleteTripParams = {
  tripId: string | undefined;
}

export async function deleteTrip({ tripId }: deleteTripParams) {
  if (!tripId) throw new Error("No trip ID provided.");

  const tripRef = doc(db, "trips", tripId);
  await deleteDoc(tripRef);
}

type transferTripOwnershipParams = {
  tripId: string | undefined;
  selectedUserId: string | undefined;
}

export async function transferTripOwnership({ tripId, selectedUserId }: transferTripOwnershipParams) {
  if (!tripId) throw new Error("Missing tripId");
  if (!selectedUserId) throw new Error("Missing selectedUserId");

  const tripRef = doc(db, "trips", tripId);

  await updateDoc(tripRef, {
    ownerId: selectedUserId,
    updatedAt: serverTimestamp(),
  });
}

type fetchTripsTogetherCountParams = {
  currentUserUid: string | undefined;
  otherUserUid: string;
}

type FetchTripsTogetherCountReturn = {
  count: number;
};

export const fetchTripsTogetherCount = async ({ currentUserUid, otherUserUid }: fetchTripsTogetherCountParams): Promise<number> => {
  if (!currentUserUid) throw new Error("Current user UID not found");

  const fn = httpsCallable<fetchTripsTogetherCountParams, FetchTripsTogetherCountReturn>(functions, "getTripsTogether");
  const result = await fn({ currentUserUid, otherUserUid });

  return result.data.count;
};