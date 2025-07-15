import { useQuery } from "@tanstack/react-query";
import { TripEvent } from "@/types/tripEvent";
import { fetchTripEvents } from "@/api/events";
import TimelineContent from "./TimelineContent";
import TimelineDay from "./TimelineDay";
import TimelineHeader from "./TimelineHeader";
import dayjs from "dayjs";

interface TrimTimelineProps {
    tripId: string | undefined,
    startDate: Date | null,
    endDate: Date | null,
    isOwner: boolean
}

export default function TripTimeline({ tripId, startDate, endDate, isOwner }: TrimTimelineProps) {
    const normalizedStart = dayjs(startDate).startOf("day");
    const normalizedEnd = dayjs(endDate).endOf("day");
    const numberOfDays = normalizedEnd.diff(normalizedStart, "days") + 1;

    const { data: events = [], isLoading, isError } = useQuery<TripEvent[]>({
        queryKey: ["events", { tripId }],
        queryFn: () => fetchTripEvents({ tripId }),
        enabled: numberOfDays > 0,
        staleTime: 10000,
    });

    if (isNaN(numberOfDays)) {
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
        const dayDate = normalizedStart.add(i, "days").toDate();
        const dayDateLabel = dayjs(dayDate).format("MMM D");
        // Select events for this date (compare only day part)
        const dayEvents = events.filter(event =>
            dayjs(event.from).isSame(dayDate, "day")
        );

        timelineDays.push(
            <TimelineDay key={dayDateLabel}>
                <TimelineHeader dayNumber={dayNumber} dayDate={dayDateLabel} />
                <TimelineContent dayNumber={dayNumber} events={dayEvents} tripId={tripId} isOwner={isOwner} />
            </TimelineDay>
        );
    }

    return (
        <div className="size-auto">
            <div className="flex flex-col gap-8">
                {timelineDays}
            </div>
        </div>
    );
}