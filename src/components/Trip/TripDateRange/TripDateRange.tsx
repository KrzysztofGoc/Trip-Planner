import { useState, useEffect } from "react";
import TripDateRangeEditor from "./TripDateRangeEditor";
import TripDateRangePreview from "./TripDateRangePreview";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";

type TripDateRangeProps = {
    startDate: Date | null;
    endDate: Date | null;
    tripId: string | undefined;
    isOwner: boolean;
}

export default function TripDateRange({ startDate, endDate, tripId, isOwner }: TripDateRangeProps) {
    const [editing, setEditing] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>(startDate && endDate ? { from: startDate, to: endDate } : undefined);

    useEffect(() => {
        // Whenever startDate or endDate props change (i.e. after a rollback), update local state
        setRange(startDate && endDate ? { from: startDate, to: endDate } : undefined);
    }, [startDate, endDate]);

    // Formatted dates derived from range
    const formattedStartDate = range?.from ? dayjs(range.from).format("MMM D, YYYY") : "Not selected";
    const formattedEndDate = range?.to ? dayjs(range.to).format("MMM D, YYYY") : "Not selected";

    return (
        <div className={`flex flex-col items-center justify-center border-1 border-gray-200 gap-2 ${editing && "gap-4"} px-6 pt-6 rounded-lg shadow-md ${editing && "pb-6"} ${!isOwner && "pb-8"}`}>

            <TripDateRangePreview formattedStart={formattedStartDate} formattedEnd={formattedEndDate} />

            {isOwner && editing && (
                <TripDateRangeEditor
                    startDate={startDate}
                    endDate={endDate}
                    tripId={tripId}
                    onClose={() => setEditing(false)}
                    range={range}
                    setRange={setRange}
                />
            )}
            {isOwner && !editing && (
                <button
                    aria-label={editing ? "Close calendar" : "Open calendar"}
                    className="w-full h-12 flex justify-center items-center cursor-pointer"
                    onClick={() => (editing ? setEditing(false) : setEditing(true))}
                >
                    <ChevronDown className="text-red-400" />
                </button>
            )}
        </div>
    );
}
