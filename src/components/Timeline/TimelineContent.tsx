import TimelineEvent from "./TimelineEvent";
import TimelineAddEventButton from "./TimelineAddEventButton";
import { TripEvent } from "@/types/tripEvent";

interface TimelineContentProps {
    events: TripEvent[];
    dayNumber: number,
}

export default function TimelineContent({ events, dayNumber }: TimelineContentProps) {
    return (
        <div className="flex flex-col gap-2 pr-4">
            {!events || events.length === 0 ? (
                <p className="text-gray-500 italic">No events planned for this day.</p>
            ) : (
                events.map((event) => (
                    <TimelineEvent key={event.id} event={event} />
                ))
            )}

            <TimelineAddEventButton dayId={dayNumber} />
        </div>
    );
}