import { Triangle } from "lucide-react";
import PlaceCard from "../PlaceCard";
import { TripEvent } from "@/types/tripEvent";
import dayjs from "dayjs";

interface TimelineEventProps {
    event: TripEvent
}

export default function TimelineEvent({ event }: TimelineEventProps) {
    return (
        <div className="flex flex-col gap-1">
            {/* Start Time Handle with Horizontal Line */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{dayjs(event.from).format("HH:mm")}</p>
                <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
            </div>

            {/* Event Details */}
            <PlaceCard event={event} />

            {/* End Time Handle with Horizontal Line */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{dayjs(event.to).format("HH:mm")}</p>
                <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
            </div>
        </div>
    );
}