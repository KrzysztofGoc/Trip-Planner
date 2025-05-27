import { useState } from "react";
import TripDateRangeEditor from "./TripDateRangeEditor";
import TripDateRangePreview from "./TripDateRangePreview";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";

interface TripDateRangeProps {
    startDate: Date;
    endDate: Date;
    tripId: string | undefined;
}

export default function TripDateRange({ startDate, endDate, tripId }: TripDateRangeProps) {
    const [editing, setEditing] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>({
        from: startDate,
        to: endDate,
    });

    // Formatted dates derived from range
    const formattedStartDate = range?.from ? dayjs(range.from).format("MMM D, YYYY") : "Not selected";
    const formattedEndDate = range?.to ? dayjs(range.to).format("MMM D, YYYY") : "Not selected";

    return (
        <div className={`flex flex-col items-center justify-center border-1 border-gray-200 gap-2 px-6 pt-6 rounded-lg shadow-md ${editing && "pb-6"}`}>

            <TripDateRangePreview startDate={formattedStartDate} endDate={formattedEndDate} />

            {editing && (
                <TripDateRangeEditor
                    startDate={startDate}
                    endDate={endDate}
                    tripId={tripId}
                    onClose={() => setEditing(false)}
                    range={range}
                    setRange={setRange}
                />
            )}
            {!editing && (
                <button
                    aria-label={editing ? "Close calendar" : "Open calendar"}
                    className="w-full h-12 flex justify-center items-center"
                    onClick={() => (editing ? setEditing(false) : setEditing(true))}
                >
                    <ChevronDown className="text-red-400" />
                </button>
            )}
        </div>
    );
}
