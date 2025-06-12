import { useQuery } from "@tanstack/react-query";
import { TripEvent } from "@/types/tripEvent";
import { fetchTripEvents } from "@/api/events";
import TimelineContent from "./TimelineContent";
import TimelineDay from "./TimelineDay";
import TimelineHeader from "./TimelineHeader";
import dayjs from "dayjs";

interface TrimTimelineProps {
    tripId: string | undefined,
    startDate: Date,
    endDate: Date,
}

export default function TripTimeline({ tripId, startDate, endDate }: TrimTimelineProps) {

    const numberOfDays = dayjs(endDate).diff(startDate, "days") + 1;

    const { data: events, isLoading, isError } = useQuery<TripEvent[]>({
        queryKey: ["events", { tripId }],
        queryFn: () => fetchTripEvents({ tripId }),
        enabled: numberOfDays > 0,
    });

    if (numberOfDays < 1) {
        return <p className="text-gray-500 italic">No events planned for this trip.</p>;
    }

    if (isLoading) {
        return <p className="text-gray-500 italic">Loading events...</p>;
    }
    if (isError) {
        return <p className="text-red-500 italic">Failed to load events.</p>;
    }

    const timelineDays = [];

    for (let i = 0; i < numberOfDays; i++) {
        const dayNumber = i + 1;
        const dayDate = dayjs(startDate).add(i, "days").toDate();
        const dayDateLabel = dayjs(dayDate).format("MMM D");
        // Select events for this date (compare only date part)
        const dayEvents = (events ?? []).filter(event =>
            dayjs(event.eventDate).isSame(dayDate, "day")
        );

        timelineDays.push(
            <TimelineDay key={dayDateLabel}>
                <TimelineHeader dayNumber={dayNumber} dayDate={dayDateLabel} />
                <TimelineContent dayNumber={dayNumber} events={dayEvents} />
            </TimelineDay>
        );
    }

    return (
        <div className="size-auto border-b-2 border-gray-200 pb-6">
            <div className="flex flex-col gap-16">
                {timelineDays}
            </div>
        </div>
    );
}