import { TripEvent } from "@/types/tripEvent";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, DocumentData, deleteDoc } from "firebase/firestore";
import dayjs from "dayjs";

interface FetchTripEventParams {
  tripId: string | undefined;
  eventId: string | undefined;
}

// Helper to convert Firestore data to TripEvent with from and to as Date
const parseTripEvent = (id: string, data: DocumentData): TripEvent => {

  const parsedTripEvent = {
    id,
    name: data.name,
    category: data.category,
    img: data.img,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    from: data.from.toDate(),
    to: data.to.toDate(),
  };

  return parsedTripEvent;
};

export const fetchTripEvent = async ({ tripId, eventId }: FetchTripEventParams): Promise<TripEvent> => {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!eventId) throw new Error("Event ID is missing");

  const eventRef = doc(db, "trips", tripId, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    throw new Error(`Event with id ${eventId} not found`);
  }

  return parseTripEvent(eventSnap.id, eventSnap.data());
};

type FetchTripEventsParams = {
  tripId: string | undefined;
}

export const fetchTripEvents = async ({ tripId }: FetchTripEventsParams): Promise<TripEvent[]> => {
  if (!tripId) throw new Error("Trip ID is missing");

  const eventsRef = collection(db, "trips", tripId, "events");
  const snapshot = await getDocs(eventsRef);

  const data = snapshot.docs.map(doc => parseTripEvent(doc.id, doc.data()));

  return data;
};

/**
 * Fetch all events for a trip **on a specific day**
 * @param tripId Trip id
 * @param dayDate Date object for the day
 */
export const fetchTripEventsForDay = async (tripId: string | undefined, dayDate: Date): Promise<TripEvent[]> => {
  if (!tripId) throw new Error("Trip ID is missing");

  // Fetch all events for this trip (client-side filter)
  const eventsRef = collection(db, "trips", tripId, "events");
  const snapshot = await getDocs(eventsRef);

  const allEvents = snapshot.docs.map(doc => parseTripEvent(doc.id, doc.data()));

  // Only events whose 'from' is on the same calendar day as 'dayDate'
  return allEvents.filter(ev => dayjs(ev.from).isSame(dayDate, "day"));
};


interface DeleteTripEventParams {
  tripId: string | undefined;
  eventId: string | undefined;
}

/**
 * Delete a single trip event from Firestore.
 * @param tripId - Trip id
 * @param eventId - Event id
 */
export const deleteTripEvent = async ({ tripId, eventId }: DeleteTripEventParams): Promise<void> => {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!eventId) throw new Error("Event ID is missing");

  const eventRef = doc(db, "trips", tripId, "events", eventId);
  await deleteDoc(eventRef);
};