import { TripEvent } from "@/types/tripEvent";
import TimelineContent from "./TimelineContent";
import TimelineDay from "./TimelineDay";
import TimelineHeader from "./TimelineHeader";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { useMediaQuery } from "usehooks-ts";
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'

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
        return null;
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
            <motion.div>
                <TimelineDay key={dayDateLabel}>
                    <TimelineHeader
                        dayNumber={dayNumber}
                        dayDate={dayDateLabel}
                        isExpanded={isExpanded}
                        onClick={() => handleToggleDay(dayNumber)}
                        hasEvents={dayEvents.length > 0}
                    />
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                key={`timeline-content-${dayNumber}`}
                                initial={{ opacity: 0, y: -16, height: 0, }}
                                animate={{
                                    opacity: 1, y: 0, height: "auto",
                                    transition: {
                                        height: { duration: 0.3 },

                                        y: { delay: (isDesktop ? 0.6 : 0.2), duration: 0.3 },
                                        opacity: { delay: (isDesktop ? 0.6 : 0.2), duration: 0.3 },
                                    }
                                }}
                                exit={{
                                    opacity: 0, y: 16, height: 0,
                                    transition: {
                                        y: { duration: 0.3 },
                                        opacity: { duration: 0.3 },

                                        height: { delay: 0.15, duration: 0.3 },
                                    }
                                }}
                            >
                                <TimelineContent
                                    dayNumber={dayNumber}
                                    events={dayEvents}
                                    tripId={tripId}
                                    isOwner={isOwner}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </TimelineDay>
            </motion.div>
        );
    }

    // Split into expanded/collapsed for layout
    const expandedDayIndex = timelineDays.findIndex((_, i) => expandedDay === i + 1);

    return (
        <div className="w-full px-2 md:px-4">
            {isDesktop ? (
                <div className="grid grid-cols-3 gap-8 w-full h-full">
                    {/* Left: Expanded day */}
                    <div className="col-span-2 row-start-1 relative">
                        <AnimatePresence initial={false}>
                            {expandedDayIndex !== -1 && (
                                <motion.div
                                    layout
                                    className="absolute left-0 top-0 w-full"
                                    key={`timeline-expanded-${expandedDayIndex}`}
                                    layoutId={`timeline-day-${expandedDayIndex}`}
                                    transition={{ layout: { duration: 0.44 } }}
                                >
                                    {timelineDays[expandedDayIndex]}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Right: Collapsed days */}
                    <div className="col-start-3 row-start-1 flex flex-col gap-2">
                        <AnimatePresence initial={false}>
                            <LayoutGroup>
                                {timelineDays.map((day, i) => {
                                    if (i === expandedDayIndex) return null;
                                    return (
                                        <motion.div
                                            layout="position"
                                            key={`timeline-collapsed-${i}`}
                                            layoutId={`timeline-day-${i}`}
                                            transition={{ layout: { duration: 0.44 } }}
                                        >
                                            {day}
                                        </motion.div>
                                    );
                                })}
                            </LayoutGroup>
                        </AnimatePresence>

                    </div>
                </div>
            ) : (
                // Mobile: just a flat list
                <div className="flex flex-col gap-2">
                    <LayoutGroup>
                        {timelineDays}
                    </LayoutGroup>
                </div>
            )}
        </div>
    );
}
