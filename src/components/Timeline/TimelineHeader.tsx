interface TimelineHeaderProps {
    dayNumber: number,
    dayDate: string,
}

export default function TimelineHeader({ dayNumber, dayDate }: TimelineHeaderProps) {
    return (
        <div className="size-auto flex flex-col gap-2 border-l-4 border-red-400 rounded-tl-md bg-gray-100 p-4 ">
            <h1 className="text-xl font-bold">
                Day {dayNumber}
            </h1>
            <p className="text-sm text-gray-500">
                {dayDate}
            </p>
        </div>
    );
}