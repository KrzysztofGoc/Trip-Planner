import { Triangle } from "lucide-react";

interface Event {
    id: string;
    from: string;
    to: string;
    destination: string;
}

interface TimelineContentProps {
    events: Event[];
}

export default function TimelineContent({ events }: TimelineContentProps) {
    return (
        <div className="flex flex-col gap-2 pr-4">
            {!events && <p>Seems like you haven't added any places yet</p>}
            {events && (
                events.map((event) => (
                    /* Event Container */
                    <div className="flex flex-col gap-1">
                        {/* Start Time Handle with Horizontal Line */}
                        <div className="flex items-center gap-2">
                            <Triangle className="size-6 text-red-400 rotate-90" />
                            <p className="text-xs font-semibold">{event.from}</p>
                            <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
                        </div>

                        <div key={event.id} className="border-l-4 border-red-400 p-4 bg-gray-50">
                            <p>
                                {`From: ${event.from} To: ${event.to}`}
                            </p>
                            <p>
                                {`Destination: ${event.destination}`}
                            </p>
                        </div>

                        {/* End Time Handle with Horizontal Line */}
                        <div className="flex items-center gap-2">
                            <Triangle className="size-6 text-red-400 rotate-90" />
                            <p className="text-xs font-semibold">{event.to}</p>
                            <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}