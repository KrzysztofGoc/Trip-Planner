import TimelineEvent from "./TimelineEvent";
import TimelineAddEventButton from "./TimelineAddEventButton";
import { TripEvent } from "@/types/tripEvent";

type TimelineContentProps = {
    events: TripEvent[];
    dayNumber: number,
    tripId: string | undefined,
    isOwner: boolean,
}

export default function TimelineContent({ events, dayNumber, tripId, isOwner }: TimelineContentProps) {
    return (
        <div className="flex flex-col gap-2 pr-0">
            {events.length === 0 ? (
                <p className="text-gray-500 italic">No events planned for this day.</p>
            ) : (
                events.map((event) => (
                    <TimelineEvent key={event.id} event={event} tripId={tripId} isOwner={isOwner}/>
                ))
            )}

            {isOwner && <TimelineAddEventButton dayNumber={dayNumber} />}
        </div>
    );
}