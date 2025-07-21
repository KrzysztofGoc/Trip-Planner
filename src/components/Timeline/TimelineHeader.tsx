import { ChevronDown } from "lucide-react";

interface TimelineHeaderProps {
    dayNumber: number,
    dayDate: string,
    isExpanded: boolean,
    hasEvents: boolean,
    onClick: () => void,
}

// TimelineHeader.tsx
export default function TimelineHeader({
  dayNumber, dayDate, isExpanded, hasEvents, onClick
}: TimelineHeaderProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between border-l-4 border-red-400 rounded-md bg-gray-100 px-4 py-3 transition-all hover:bg-gray-200 group"
      aria-expanded={isExpanded}
    >
      <div className="flex flex-col text-left">
        <span className="text-base font-bold">Day {dayNumber}</span>
        <span className={`text-sm ${hasEvents ? "text-gray-500" : "text-gray-400 italic"}`}>
          {dayDate}
        </span>
      </div>
      <ChevronDown
        className={`size-6 text-red-400 transition ${!isExpanded && "group-hover:scale-120"}  ${isExpanded && "rotate-180"}`}
      />
    </button>
  );
}
