import { TripEvent } from "@/types/tripEvent";
import TimelineContent from "./TimelineContent";
import TimelineDay from "./TimelineDay";
import TimelineHeader from "./TimelineHeader";
import dayjs from "dayjs";
import { useState, useMemo } from "react";

interface TrimTimelineProps {
    tripId: string | undefined,
    events: TripEvent[];
    startDate: Date | null,
    endDate: Date | null,
    isOwner: boolean
}

export default function TripTimeline({ tripId, events, startDate, endDate, isOwner }: TrimTimelineProps) {
    const normalizedStart = dayjs(startDate).startOf("day");
    const normalizedEnd = dayjs(endDate).endOf("day");
    const numberOfDays = normalizedEnd.diff(normalizedStart, "days") + 1;

    // Pre-calculate events per day for efficient access
    const eventsByDay = useMemo(() => {
        const map = new Map<number, TripEvent[]>();
        if (!startDate || !events || isNaN(numberOfDays)) return map;
        const start = dayjs(startDate).startOf("day");

        for (let i = 0; i < numberOfDays; i++) {
            const dayNumber = i + 1;
            const dayDate = start.add(i, "days");
            const dayEvents = events.filter(event =>
                dayjs(event.from).isSame(dayDate, "day")
            );
            map.set(dayNumber, dayEvents);
        }
        return map;
    }, [events, startDate, numberOfDays]);

    // Find the first day with events to expand it by default
    const firstDayWithEvents = useMemo(() => {
        for (const [day, dayEvents] of eventsByDay.entries()) {
            if (dayEvents.length > 0) return day;
        }
        // Fallback to the first day if no events or if trip is empty
        return numberOfDays > 0 ? 1 : null;
    }, [eventsByDay, numberOfDays]);

    // State to track the currently expanded day
    const [expandedDay, setExpandedDay] = useState<number | null>(firstDayWithEvents);

    const handleToggleDay = (dayNumber: number) => {
        setExpandedDay(current => (current === dayNumber ? null : dayNumber));
    };

    if (isNaN(numberOfDays) || numberOfDays <= 0) {
        return null; // Or a placeholder message if you prefer
    }

    const timelineDays = [];
    for (let i = 0; i < numberOfDays; i++) {
        const dayNumber = i + 1;
        const dayDate = normalizedStart.add(i, "days").toDate();
        const dayDateLabel = dayjs(dayDate).format("MMM D");
        const dayEvents = eventsByDay.get(dayNumber) || [];
        const isExpanded = expandedDay === dayNumber;

        timelineDays.push(
            <TimelineDay key={dayDateLabel}>
                <TimelineHeader
                    dayNumber={dayNumber}
                    dayDate={dayDateLabel}
                    isExpanded={isExpanded}
                    onClick={() => handleToggleDay(dayNumber)}
                    hasEvents={dayEvents.length > 0}
                />
                {isExpanded && (
                    <TimelineContent
                        dayNumber={dayNumber}
                        events={dayEvents}
                        tripId={tripId}
                        isOwner={isOwner}
                    />
                )}
            </TimelineDay>
        );
    }

    return (
        <div className="size-auto">
            <div className="flex flex-col gap-2">
                {timelineDays}
            </div>
        </div>
    );
}