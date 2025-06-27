import { Place } from "@/types/place";

interface PlaceCardProps {
    event: Place,
    onClick?: () => void;
}

export default function PlaceCard({ event, onClick }: PlaceCardProps) {
    return (
        <div onClick={onClick} role="button" className="border-l-4 border-red-400 bg-gray-50 flex shadow-md rounded-lg h-fit">
            <img src="https://images.unsplash.com/photo-1667840578874-ef842d59c824" className="size-32 aspect-square object-cover rounded-l-sm" />
            <div className="flex flex-col p-4 pr-12 justify-center grow">
                <p className="text-md font-bold select-none">
                    {event.name}
                </p>
                <p className="text-gray-500 font-light text-sm select-none">
                    {event.category}
                </p>
            </div>
        </div>
    );
}