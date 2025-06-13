import { MoveRight } from "lucide-react";

interface DateRangeSummaryProps {
    formattedStart: string;
    formattedEnd: string;
}

export default function TripDateRangePreview({ formattedStart, formattedEnd }: DateRangeSummaryProps) {
    return (
        <div className="flex gap-4 items-center">
            {/* From */}
            <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-gray-500">From</span>
                <span className="text-lg font-semibold whitespace-nowrap">{formattedStart}</span>
            </div>

            {/* Arrow */}
            <MoveRight className="size-6 text-red-400 stroke-2" />

            {/* To */}
            <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-gray-500">To</span>
                <span className="text-lg font-semibold whitespace-nowrap">{formattedEnd}</span>
            </div>
        </ div>
    );
}
