import { TripEvent } from "./tripEvent";
import { Participant } from "./participant";

export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    image: string;
    participants: Participant[],
    events: TripEvent[];
  }