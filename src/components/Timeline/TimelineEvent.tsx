import { Triangle } from "lucide-react";
import EventCard from "../EventCard";

interface TimelineEventProps {
    event: {
        id: string;
        from: string;
        to: string;
        destination: string;
        img: string,
    };
}

export default function TimelineEvent({ event }: TimelineEventProps) {
    return (
        <div className="flex flex-col gap-1">
            {/* Start Time Handle with Horizontal Line */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{event.from}</p>
                <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
            </div>

            {/* Event Details */}
            <EventCard event={event} />

            {/* End Time Handle with Horizontal Line */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{event.to}</p>
                <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
            </div>
        </div>
    );
}