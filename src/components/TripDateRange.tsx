import { MoveRight } from "lucide-react";

interface TripDateRangeProps {
    startDate: string;
    endDate: string;
}

export default function TripDateRange({ startDate, endDate }: TripDateRangeProps) {
    return (
        <div className="size-auto flex items-center justify-center border-1 border-gray-200 gap-4 p-6 rounded-xl shadow-md">
            <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-gray-500">From</span>
                <span className="text-lg font-semibold">{startDate}</span>
            </div>

            <MoveRight className="size-6 text-red-400 stroke-2" />

            <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-gray-500">To</span>
                <span className="text-lg font-semibold">{endDate}</span>
            </div>
        </div>
    );
}