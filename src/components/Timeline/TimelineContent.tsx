import TimelineEvent from "./TimelineEvent";
import TimelineAddEventButton from "./TimelineAddEventButton";

interface Event {
    id: string;
    from: string;
    to: string;
    destination: string;
    img: string,
}

interface TimelineContentProps {
    events: Event[];
}

export default function TimelineContent({ events }: TimelineContentProps) {
    return (
        <div className="flex flex-col gap-2 pr-4">
            {!events || events.length === 0 ? (
                <p className="text-gray-500 italic">No events planned for this day.</p>
            ) : (
                events.map((event) => <TimelineEvent key={event.id} event={event} />)
            )}

            <TimelineAddEventButton />
        </div>
    );
}