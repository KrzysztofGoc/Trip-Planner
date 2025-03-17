import { Place } from "./place";

export interface TripEvent extends Place {
    dayNumber: number,
    from: string;
    to: string;
}