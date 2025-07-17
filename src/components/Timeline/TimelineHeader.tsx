import { ChevronDown } from "lucide-react";

interface TimelineHeaderProps {
    dayNumber: number,
    dayDate: string,
    isExpanded: boolean,
    hasEvents: boolean,
    onClick: () => void,
}

export default function TimelineHeader({ dayNumber, dayDate, isExpanded, hasEvents, onClick }: TimelineHeaderProps) {
    return (
        // Use a <button> for accessibility and add the onClick handler
        <button
            onClick={onClick}
            className="w-full size-auto flex items-center gap-2 border-l-4 border-red-400 rounded-md bg-gray-100 p-4 transition-all duration-200 hover:bg-gray-200"
            aria-expanded={isExpanded}
        >
            <div className="flex flex-col text-left">
                <h1 className="text-xl font-bold">
                    Day {dayNumber}
                </h1>
                <p className={`text-sm ${hasEvents ? "text-gray-500" : "text-gray-400 italic"}`}>
                    {dayDate}
                </p>
            </div>
            
            <ChevronDown
                className={`ml-auto size-5 text-red-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
        </button>
    );
}