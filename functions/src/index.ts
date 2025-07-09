import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentDeleted, onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { TripEvent } from "./types/event";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import dayjs from "dayjs";

admin.initializeApp();

export const updateTripDateRange = onCall(async (request) => {
  const { tripId, startDate, endDate } = request.data || {};

  // TODO: Add auth validation later

  // Validate input
  if (!tripId || !startDate || !endDate) {
    throw new HttpsError("invalid-argument", "Missing data: tripId, startDate, endDate required.");
  }

  const newFrom = new Date(startDate);
  const newTo = new Date(endDate);

  if (isNaN(newFrom.getTime()) || isNaN(newTo.getTime())) {
    throw new HttpsError("invalid-argument", "Invalid dates provided.");
  }
  if (newFrom > newTo) {
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
  const orphans: TripEvent[] = [];

  snapshot.forEach(doc => {
    const data = doc.data() as TripEvent;

    // Defensive checks
    if (!data.from || !data.to) return;

    let fromDate: Date;
    let toDate: Date;

    if (data.from instanceof Timestamp) {
      fromDate = data.from.toDate();
    } else {
      return;
    }

    if (data.to instanceof Timestamp) {
      toDate = data.to.toDate();
    } else {
      return;
    }

    if (isNaN(toDate.getTime()) || isNaN(fromDate.getTime())) return; // skip malformed

    if (
      dayjs(fromDate).isBefore(newFrom, "day") ||
      dayjs(toDate).isAfter(newTo, "day")
    ) {
      orphans.push(data);
      batch.delete(doc.ref);
    }
  });

  // Update trip document
  batch.update(tripRef, {
    startDate: Timestamp.fromDate(newFrom),
    endDate: Timestamp.fromDate(newTo),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Commit changes
  await batch.commit();

  return { success: true };
});

// Fetch user data by UID
exports.getUserData = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const { uid } = request.data || {};

  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing data: uid.");
  }

  try {
    // Fetch the user data using Firebase Admin SDK
    const userRecord = await admin.auth().getUser(uid);

    // Return the user data
    return {
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user data:', error);
    throw new HttpsError('internal', 'Unable to fetch user data');
  }
});

export const searchUsers = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const { query, tripId } = request.data || {};

  if (!query || typeof query !== "string" || !tripId) {
    throw new HttpsError("invalid-argument", "Missing data: query or tripId.");
  }

  // Fetch the trip from Firestore and check ownership
  const tripDoc = await admin.firestore().collection("trips").doc(tripId).get();
  if (!tripDoc.exists) {
    throw new HttpsError("not-found", "Trip not found.");
  }
  const trip = tripDoc.data();
  if (!trip || trip.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the trip owner can search users.");
  }

  // List and filter users
  const lowerQuery = query.toLowerCase();
  const allUsers: admin.auth.UserRecord[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allUsers.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  const filtered = allUsers.filter((user) => {
    const name = user.displayName?.toLowerCase() ?? "";
    return name.includes(lowerQuery);
  });

  return filtered.slice(0, 10).map((user) => ({
    uid: user.uid,
    displayName: user.displayName || "Unknown",
    photoURL: user.photoURL || "",
  }));
});

export const onTripDeleted = onDocumentDeleted("trips/{tripId}", async (event) => {
  const { tripId } = event.params;
  const db = admin.firestore();

  // (2) If you don’t have a participant array, fetch participants from subcollection
  let allParticipantUids: string[] = [];
  const participantsSnap = await db.collection(`trips/${tripId}/participants`).get();

  participantsSnap.forEach(doc => {
    allParticipantUids.push(doc.id); // assuming doc.id is the uid
  });

  const batch = db.batch();

  // (3) Cleanup /userTrips/{uid}/trips/{tripId}
  allParticipantUids.forEach(uid => {
    batch.delete(db.doc(`userTrips/${uid}/trips/${tripId}`));
  });

  // (4) Delete participants subcollection (server-side recursive delete)
  const participantsCollection = db.collection(`trips/${tripId}/participants`);
  const participants = await participantsCollection.listDocuments();
  for (const docRef of participants) {
    batch.delete(docRef);
  }

  // (5) Delete events subcollection
  const eventsCollection = db.collection(`trips/${tripId}/events`);
  const events = await eventsCollection.listDocuments();
  for (const docRef of events) {
    batch.delete(docRef);
  }

  // Commit all deletes
  await batch.commit();
});

export const onParticipantAdded = onDocumentCreated("trips/{tripId}/participants/{userId}", async (event) => {
  const { tripId, userId } = event.params;
  const db = admin.firestore();

  // Create reference to the trip
  const tripRef = db.doc(`trips/${tripId}`);

  await db
    .doc(`userTrips/${userId}/trips/${tripId}`)
    .set({
      tripRef,
      joinedAt: FieldValue.serverTimestamp(),
    });
});

export const onParticipantRemoved = onDocumentDeleted(
  "trips/{tripId}/participants/{userId}",
  async (event) => {
    const { tripId, userId } = event.params;
    const db = admin.firestore();

    // Remove the userTrip entry for this user/trip combo
    const userTripRef = db.doc(`userTrips/${userId}/trips/${tripId}`);
    await userTripRef.delete();
  });

export const getTripsTogether = onCall(async (request) => {
  const { currentUserUid, otherUserUid } = request.data;

  if (!request.auth || request.auth.uid !== currentUserUid) {
    throw new HttpsError("permission-denied", "You can only fetch your own shared trips.");
  }
  if (!currentUserUid || !otherUserUid) {
    throw new HttpsError("invalid-argument", "Missing required data");
  }

  const currentUserTripsRef = admin.firestore().collection(`userTrips/${currentUserUid}/trips`);
  const otherUserTripsRef = admin.firestore().collection(`userTrips/${otherUserUid}/trips`);

  const [currentUserDocRefs, otherUserDocRefs] = await Promise.all([
    currentUserTripsRef.listDocuments(),
    otherUserTripsRef.listDocuments()
  ]);

  const currentUserTripIds = new Set(currentUserDocRefs.map(ref => ref.id));
  const otherUserTripIds = new Set(otherUserDocRefs.map(ref => ref.id));

  // Intersection: count trips both are in
  let sharedTripCount = 0;
  for (const id of currentUserTripIds) {
    if (otherUserTripIds.has(id)) sharedTripCount++;
  }

  return { count: sharedTripCount };
});
