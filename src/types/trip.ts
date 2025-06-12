import { Participant } from "./participant";
import { Timestamp } from "firebase/firestore";

export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    description: string;
    image: string | null;
    participants: Participant[],
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }