import { TripEvent } from "./tripEvent";
import { Participant } from "./participant";
import { Timestamp } from "firebase/firestore";

export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    image: string | null;
    participants: Participant[],
    events: TripEvent[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }