import { Place } from "@/types/place";

interface EventCardProps {
    event: Place
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <div key={event.id} className="border-l-4 border-red-400 bg-gray-50 flex shadow-md rounded-lg h-fit">
            <img src={event.img} className="size-32 aspect-square object-cover rounded-l-sm" />
            <div className="flex flex-col p-4 justify-center grow">
                <p className="text-lg font-bold">
                    {event.name}
                </p>
                <p className="text-gray-500 text-sm">
                    {event.category}
                </p>
            </div>
        </div>
    );
}