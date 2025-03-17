import { TripEvent } from "@/types/tripEvent";
import TimelineContent from "./TimelineContent";
import TimelineDay from "./TimelineDay";
import TimelineHeader from "./TimelineHeader";
import dayjs from "dayjs";

interface TrimTimelineProps {
    events: TripEvent[],
    startDate: string,
    endDate: string,
}

export default function TripTimeline({ events, startDate, endDate }: TrimTimelineProps) {

    const numberOfDays = dayjs(endDate).diff(startDate, "days") + 1;

    if (numberOfDays === 0) {
        return <p className="text-gray-500 italic">No events planned for this trip.</p>;
    }

    const timelineDays = [];

    for (let i = 0; i < numberOfDays; i++) {
        const dayNumber = i + 1;
        const dayEvents = events.filter(event => event.dayNumber === dayNumber);
        const dayDate = dayjs(startDate).add(i, "days").format("MMM D");

        timelineDays.push(
            <TimelineDay key={dayNumber}>
                <TimelineHeader dayNumber={dayNumber} dayDate={dayDate} />
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