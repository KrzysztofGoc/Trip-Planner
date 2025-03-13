import { Triangle } from "lucide-react";

interface TimelineEventProps {
    event: {
        id: string;
        from: string;
        to: string;
        destination: string;
        img: string,
    };
}

export default function TimelineEvent({ event }: TimelineEventProps) {
    return (
        <div className="flex flex-col gap-1">
            {/* Start Time Handle with Horizontal Line */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{event.from}</p>
                <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
            </div>

            {/* Event Details */}
            <div key={event.id} className="border-l-4 border-red-400 bg-gray-50 flex shadow-md rounded-lg">
                <img src={event.img} className="size-32 aspect-square object-cover rounded-l-sm" />
                <div className="flex flex-col p-4 justify-center grow">
                    <p className="text-lg font-bold">
                        {event.destination}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Park
                    </p>
                </div>
            </div>

            {/* End Time Handle with Horizontal Line */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{event.to}</p>
                <div className="h-0.5 w-full bg-gray-200"></div> {/* Horizontal Line */}
            </div>
        </div>
    );
}