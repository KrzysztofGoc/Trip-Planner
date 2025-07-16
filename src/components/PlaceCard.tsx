import LazyLoad from 'react-lazyload';
import { Place } from "@/types/place";

interface PlaceCardProps {
    event: Place;
    onClick?: () => void;
}

export default function PlaceCard({ event, onClick }: PlaceCardProps) {
    return (
        <LazyLoad
            height={128}
            offset={-200}
            once
            placeholder={<div className="h-32 animate-pulse bg-gray-300 rounded-lg" />}
        >
            <div onClick={onClick} role="button" className="border-l-4 border-red-400 bg-gray-50 flex shadow-md rounded-lg h-fit">
                {/* Image */}
                <img
                    src={"/place_default_thumbnail_image.png"} // Add placeholder or fallback image
                    className="size-32 aspect-square object-cover rounded-l-sm"
                    alt={event.name}
                />
                <div className="flex flex-col p-4 pr-12 justify-center grow">
                    <p className="text-md font-bold select-none">{event.name}</p>
                    <p className="text-gray-500 font-light text-sm select-none">{event.category}</p>
                </div>
            </div>
        </LazyLoad>
    );
}
