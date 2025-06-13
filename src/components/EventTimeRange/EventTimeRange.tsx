import { useReducer } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { fetchTripEventsForDay } from "@/api/events";
import { TripEvent } from "@/types/tripEvent";
import TripDateRangePreview from "../Trip/TripDateRange/TripDateRangePreview";
import { ChevronDown, LoaderCircle, MoveRight } from "lucide-react";
import { TimePickerWheel } from "./TimePicker/TimePickerWheel";
import { Button } from "../ui/button";

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
        // Skip currently edited event
        if (selfId && ev.id === selfId) continue;
        let start = dayjs(ev.from);
        const end = dayjs(ev.to);

        if (pickerType === "from") {
            // Block every slot inside the event but DO NOT block the end time
            while (start.isBefore(end, "minute")) {
                blockedTimes.add(start.format("HH:mm"));
                start = start.add(15, "minute");
            }
        } else if (pickerType === "to") {
            // Block every slot inside the event, but DO NOT block the start time
            while (start.isBefore(end, "minute")) {
                // Only block if not the exact event start
                if (!start.isSame(ev.from, "minute")) {
                    blockedTimes.add(start.format("HH:mm"));
                }
                start = start.add(15, "minute");
            }
            // And, block the end time itself (you can't end at the end time of an event)
            blockedTimes.add(dayjs(end).format("HH:mm"));
        }
    }

    // Map hour -> blocked minutes, and Set of fully blocked hours
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

// --- State ---
type IdleState = {
    mode: 'idle';
    range: { from: Date | null; to: Date | null };
    addingDate?: Date;
};
type EditingState = {
    mode: 'editing';
    range: { from: Date | null; to: Date | null };
    draft: { from: Date; to: Date };
    addingDate?: Date;
};
type RangeState = IdleState | EditingState;

type RangeAction =
    | { type: 'START_EDIT'; range: { from: Date | null; to: Date | null } }
    | { type: 'UPDATE_FROM'; value: { hour: string; minute: string } }
    | { type: 'UPDATE_TO'; value: { hour: string; minute: string } }
    | { type: 'CANCEL' }
    | { type: 'SAVE' };

function rangeReducer(state: RangeState, action: RangeAction): RangeState {
    switch (action.type) {
        case 'START_EDIT': {
            let from = action.range.from;
            let to = action.range.to;
            if (!from || !to) {
                if (!state.addingDate) throw new Error("No addingDate for add mode");
                from = new Date(state.addingDate); from.setHours(1, 0, 0, 0);
                to = new Date(state.addingDate); to.setHours(2, 0, 0, 0);
            }
            return {
                mode: 'editing',
                range: state.range,
                draft: { from, to },
                addingDate: state.addingDate,
            };
        }
        case 'UPDATE_FROM': {
            if (state.mode !== 'editing') return state;
            const updatedFrom = new Date(state.draft.from);
            updatedFrom.setHours(Number(action.value.hour));
            updatedFrom.setMinutes(Number(action.value.minute));
            return { ...state, draft: { ...state.draft, from: updatedFrom } };
        }
        case 'UPDATE_TO': {
            if (state.mode !== 'editing') return state;
            const updatedTo = new Date(state.draft.to);
            updatedTo.setHours(Number(action.value.hour));
            updatedTo.setMinutes(Number(action.value.minute));
            return { ...state, draft: { ...state.draft, to: updatedTo } };
        }
        case 'CANCEL':
            if (state.mode !== 'editing') return state;
            return {
                mode: 'idle',
                range: state.range,
                addingDate: state.addingDate,
            };
        case 'SAVE':
            if (state.mode !== 'editing') return state;
            return {
                mode: 'idle',
                range: { from: state.draft.from, to: state.draft.to },
                addingDate: state.addingDate,
            };
        default:
            return state;
    }
}

// --- Props for parent ---
type EventTimeRangeProps =
    | { mode: "edit"; tripId: string | undefined; from: Date; to: Date; eventId: string | undefined }
    | { mode: "add"; tripId: string | undefined; addingDate: Date };

// --- Overlap validation ---
function doesOverlap(from: Date, to: Date, allEvents: TripEvent[], selfId?: string | undefined): boolean {

    return allEvents.some(ev => {
        if (selfId && ev.id === selfId) return false;
        return dayjs(from).isBefore(ev.to, "minute") && dayjs(to).isAfter(ev.from, "minute");
    });
}

// --- Main Component ---
export default function EventTimeRange(props: EventTimeRangeProps) {
    const isAdd = props.mode === "add";
    const dayDate = props.mode === "add" ? props.addingDate : props.from;
    const eventId = props.mode === "edit" ? props.eventId : undefined;

    // Load all events for this day
    const { data: allEvents = [], isLoading: isLoadingEvents } = useQuery({
        queryKey: ["trip-events", props.tripId, dayDate.toISOString()],
        queryFn: () => fetchTripEventsForDay(props.tripId, dayDate),
    });

    // Preview/committed range state
    const [state, dispatch] = useReducer(rangeReducer, {
        mode: "idle",
        range: isAdd ? { from: null, to: null } : { from: props.from, to: props.to },
        ...(isAdd ? { addingDate: props.addingDate } : {}),
    });

    // --- Blocked hours/minutes for wheels ---
    const fromHourBlock = getBlockedHourMap(allEvents, hours, minutes, eventId, "from");
    const toHourBlock = getBlockedHourMap(allEvents, hours, minutes, eventId, "to");

    // --- Validation ---
    const isValidRange =
        state.mode === "editing"
            ? state.draft.from < state.draft.to
            : true;

    const hasOverlap =
        state.mode === "editing" &&
        allEvents &&
        doesOverlap(state.draft.from, state.draft.to, allEvents, eventId);

    // --- Preview formatting ---
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

    // --- Render ---
    return (
        <div className={`flex flex-col items-center justify-center border-1 border-gray-200 gap-2 px-6 pt-6 rounded-lg shadow-md ${state.mode === "editing" && "pb-6"}`}>
            {/* --- Editing mode --- */}
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
                        {/* --- Validation errors --- */}
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
                </>
            )}
        </div>
    );
}