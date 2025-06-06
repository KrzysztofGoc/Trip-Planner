import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { TripEvent } from "./types/event";

admin.initializeApp();

export const updateTripDateRange = onCall(async (request) => {
  const { tripId, startDate, endDate } = request.data || {};

  // TODO: Add auth validation later

  // Validate input
  if (!tripId || !startDate || !endDate) {
    throw new HttpsError("invalid-argument", "Missing data: tripId, startDate, endDate required.");
  }

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    throw new HttpsError("invalid-argument", "Invalid dates provided.");
  }
  if (newStart > newEnd) {
    throw new HttpsError("invalid-argument", "Start date must be before or equal to end date.");
  }

  // Ensure trip exists
  const tripRef = admin.firestore().collection("trips").doc(tripId);
  const tripDoc = await tripRef.get();

  if (!tripDoc.exists) {
    throw new HttpsError("not-found", "Trip not found.");
  }

  // Fetch all events for this trip
  const eventsRef = tripRef.collection("events");
  const snapshot = await eventsRef.get();

  const batch = admin.firestore().batch();

  snapshot.forEach(doc => {
    const data = doc.data() as TripEvent;
    const rawDate = data.eventDate.toDate(); // Handle Firestore Timestamp
    if (!(rawDate instanceof Date) || isNaN(rawDate.getTime())) return; // skip malformed

    if (rawDate < newStart || rawDate > newEnd) {
      batch.delete(doc.ref); // Delete orphaned event
    }
  });

  // Update trip document
  batch.update(tripRef, {
    startDate: admin.firestore.Timestamp.fromDate(newStart),
    endDate: admin.firestore.Timestamp.fromDate(newEnd),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Commit changes
  await batch.commit();

  return { success: true };
});
