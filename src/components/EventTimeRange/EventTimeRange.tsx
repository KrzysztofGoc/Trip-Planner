import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { fetchTripEventsForDay } from "@/api/events";
import { TripEvent } from "@/types/tripEvent";
import TripDateRangePreview from "../Trip/TripDateRange/TripDateRangePreview";
import { ChevronDown, LoaderCircle, MoveRight } from "lucide-react";
import { TimePickerWheel } from "./TimePicker/TimePickerWheel";
import { Button } from "../ui/button";
import { RangeState, RangeAction } from "@/state/eventRangeReducer";

// --- Utility ---
function getHM(date: Date) {
    return {
        hour: String(date.getHours()).padStart(2, "0"),
        minute: String(date.getMinutes()).padStart(2, "0"),
    };
}
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minuteStep = 15;
const minutes = Array.from({ length: 60 / minuteStep }, (_, i) =>
    String(i * minuteStep).padStart(2, "0")
);

// --- Blocked hour/minute logic ---
function getBlockedHourMap(
    allEvents: TripEvent[],
    hours: string[],
    minutes: string[],
    selfId?: string,
    pickerType: "from" | "to" = "from"
) {
    const blockedTimes = new Set<string>();
    for (const ev of allEvents) {
        if (selfId && ev.id === selfId) continue;
        let start = dayjs(ev.from);
        const end = dayjs(ev.to);

        if (pickerType === "from") {
            while (start.isBefore(end, "minute")) {
                blockedTimes.add(start.format("HH:mm"));
                start = start.add(15, "minute");
            }
        } else if (pickerType === "to") {
            while (start.isBefore(end, "minute")) {
                if (!start.isSame(ev.from, "minute")) {
                    blockedTimes.add(start.format("HH:mm"));
                }
                start = start.add(15, "minute");
            }
            blockedTimes.add(dayjs(end).format("HH:mm"));
        }
    }

    const blockedMinutesByHour: Record<string, Set<string>> = {};
    const blockedHours = new Set<string>();
    for (const hour of hours) {
        blockedMinutesByHour[hour] = new Set(
            minutes.filter(min => blockedTimes.has(`${hour}:${min}`))
        );
        if (blockedMinutesByHour[hour].size === minutes.length) {
            blockedHours.add(hour);
        }
    }
    return { blockedHours, blockedMinutesByHour };
}

type EventTimeRangeProps =
    | {
        mode: "edit";
        tripId: string | undefined;
        from: Date; to: Date;
        eventId: string | undefined;
        state: RangeState;
        dispatch: React.Dispatch<RangeAction>;
        isOwner: boolean;
    }
    | {
        mode: "add";
        tripId: string | undefined;
        addingDate: Date;
        state: RangeState;
        dispatch: React.Dispatch<RangeAction>;
        isOwner: boolean;
    };

function doesOverlap(from: Date, to: Date, allEvents: TripEvent[], selfId?: string | undefined): boolean {
    return allEvents.some(ev => {
        if (selfId && ev.id === selfId) return false;
        return dayjs(from).isBefore(ev.to, "minute") && dayjs(to).isAfter(ev.from, "minute");
    });
}

export default function EventTimeRange(props: EventTimeRangeProps) {
    const dayDate = props.mode === "add" ? props.addingDate : props.from;
    const eventId = props.mode === "edit" ? props.eventId : undefined;
    const { state, dispatch } = props;

    const { data: allEvents = [], isLoading: isLoadingEvents } = useQuery({
        queryKey: ["trip-events", props.tripId, dayDate.toISOString()],
        queryFn: () => fetchTripEventsForDay(props.tripId, dayDate),
    });

    const fromHourBlock = getBlockedHourMap(allEvents, hours, minutes, eventId, "from");
    const toHourBlock = getBlockedHourMap(allEvents, hours, minutes, eventId, "to");

    const isValidRange =
        state.mode === "editing"
            ? state.draft.from < state.draft.to
            : true;

    const hasOverlap =
        state.mode === "editing" &&
        allEvents &&
        doesOverlap(state.draft.from, state.draft.to, allEvents, eventId);

    const formattedStart =
        state.mode === "idle"
            ? state.range.from
                ? dayjs(state.range.from).format("HH:mm")
                : "Not selected"
            : "Not selected";
    const formattedEnd =
        state.mode === "idle"
            ? state.range.to
                ? dayjs(state.range.to).format("HH:mm")
                : "Not selected"
            : "Not selected";

    return (
        <div className={`flex flex-col items-center justify-center border-1 border-gray-200 gap-2 px-6 pt-6 rounded-lg shadow-md ${state.mode === "editing" && "pb-6"} ${!props.isOwner && "pb-8"}`}>

            {state.mode === "editing" ? (
                isLoadingEvents ? (
                    <div className="w-full flex flex-col gap-6 items-center py-12">
                        <LoaderCircle className="size-10 text-red-400 animate-spin" />
                        <span className="text-gray-500 text-sm">Loading available times...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-6 justify-center w-full">
                            <TimePickerWheel
                                label="From"
                                value={getHM(state.draft.from)}
                                onChange={val => dispatch({ type: "UPDATE_FROM", value: val })}
                                hours={hours}
                                minutes={minutes}
                                blockedHours={fromHourBlock.blockedHours}
                                blockedMinutes={fromHourBlock.blockedMinutesByHour[getHM(state.draft.from).hour] || new Set()}
                            />
                            <MoveRight className="size-6 min-w-6 min-h-6 text-red-400 stroke-2 mt-5" />
                            <TimePickerWheel
                                label="To"
                                value={getHM(state.draft.to)}
                                onChange={val => dispatch({ type: "UPDATE_TO", value: val })}
                                hours={hours}
                                minutes={minutes}
                                blockedHours={toHourBlock.blockedHours}
                                blockedMinutes={toHourBlock.blockedMinutesByHour[getHM(state.draft.to).hour] || new Set()}
                            />
                        </div>
                        {!isValidRange && (
                            <div className="text-sm font-semibold text-red-500 mt-2">
                                End time must be after start time.
                            </div>
                        )}
                        {hasOverlap && (
                            <div className="text-sm font-semibold text-red-500 mt-2">
                                This time range overlaps with another event.
                            </div>
                        )}
                        <div className="flex gap-2 w-full mt-4">
                            <Button
                                onClick={() => dispatch({ type: "CANCEL" })}
                                className="flex-1 h-12 bg-transparent shadow-none text-black rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => dispatch({ type: "SAVE" })}
                                disabled={!isValidRange || hasOverlap}
                                className="flex-1 h-12 bg-red-400 text-white shadow-md rounded-lg"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                )
            ) : (
                <>
                    <TripDateRangePreview formattedStart={formattedStart} formattedEnd={formattedEnd} />
                    {props.isOwner && (
                        <button
                            aria-label="Open time picker"
                            className="w-full h-12 flex justify-center items-center"
                            onClick={() =>
                                dispatch({
                                    type: "START_EDIT",
                                    range: state.range,
                                })
                            }
                        >
                            <ChevronDown className={"text-red-400"} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
