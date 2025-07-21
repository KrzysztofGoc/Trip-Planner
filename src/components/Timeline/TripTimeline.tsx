import { TripEvent } from "@/types/tripEvent";
import TimelineContent from "./TimelineContent";
import TimelineDay from "./TimelineDay";
import TimelineHeader from "./TimelineHeader";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { useMediaQuery } from "usehooks-ts";

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
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Pre-calculate events per day for efficient access
    const eventsByDay = useMemo(() => {
        const map = new Map<number, TripEvent[]>();
        if (!startDate || !events || isNaN(numberOfDays)) return map;
        const start = dayjs(startDate).startOf("day");

        for (let i = 0; i < numberOfDays; i++) {
            const dayNumber = i + 1;
            const dayDate = start.add(i, "days");
            // 1. Filter for this day
            let dayEvents = events.filter(event =>
                dayjs(event.from).isSame(dayDate, "day")
            );
            // 2. Sort by event.from (earliest first)
            dayEvents = dayEvents.sort((a, b) => dayjs(a.from).diff(dayjs(b.from)));
            // 3. Add to map
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
        setExpandedDay(current =>
        isDesktop
            ? (current === dayNumber ? current : dayNumber) // Desktop: always keep one open
            : (current === dayNumber ? null : dayNumber)    // Mobile: allow close
    );
    };

    if (isNaN(numberOfDays) || numberOfDays <= 0) {
        return null; // Or a placeholder message if you prefer
    }

    // Generate day components
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

    // Split into expanded/collapsed for layout
    const expandedDayIndex = timelineDays.findIndex((_, i) => expandedDay === i + 1);
    const expandedDayComponent = expandedDayIndex !== -1 ? timelineDays[expandedDayIndex] : null;
    const collapsedDayComponents = timelineDays.filter((_, i) => expandedDay !== i + 1);


    return (
        <div className="w-full flex flex-col md:flex-row gap-2 md:gap-12 px-2 md:px-4">
            {isDesktop ? (
                <>
                    <div className="w-2/3 flex-1 sticky top-6 h-fit">
                        {expandedDayComponent}
                    </div>
                    <div className="w-1/3 flex flex-col gap-2 sticky top-6 h-fit">
                        {collapsedDayComponents}
                    </div>
                </>
            ) : (
                // Mobile: just a flat list, no columns
                <>
                    {timelineDays}
                </>
            )}
        </div>
    );
}
