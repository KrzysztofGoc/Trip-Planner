import { useState } from 'react';
import LazyLoad from 'react-lazyload';
import { Place } from "@/types/place";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from 'motion/react'

interface PlaceCardProps {
    event: Place;
    onClick?: () => void;
}

export default function PlaceCard({ event, onClick }: PlaceCardProps) {
    const [expanded, setExpanded] = useState(false);
    const hasReviews = !!event.reviews && event.reviews.length > 0;

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the main onClick
        setExpanded(!expanded);
    };

    return (
        <LazyLoad
            height={expanded ? 300 : 128} // Adjust height based on expanded state
            offset={-64}
            once
            placeholder={<div className="h-32 animate-pulse bg-gray-300 rounded-lg" />}
        >
            <div
                onClick={onClick}
                role="button"
                className="border-l-4 border-red-400 bg-gray-50 flex shadow-md rounded-lg h-fit flex-col"
            >
                {/* Main content row */}
                <div className={`flex ${expanded && "border-b border-gray-200"}`}>
                    {/* Image */}
                    <img
                        src={event.img || "/place_default_thumbnail_image.png"}
                        className={`size-32 aspect-square object-cover ${expanded ? "rounded-tl-sm" : "rounded-l-sm"}`}
                        alt={event.name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/place_default_thumbnail_image.png";
                        }}
                    />
                    <div className="flex flex-col pl-4 pr-8 md:pr-8 justify-center grow min-w-0 gap-1">
                        {/* Truncated Event Name */}
                        <p className="text-md font-bold select-none line-clamp-2">
                            {event.name}
                        </p>
                        <p className="text-gray-500 font-light text-sm select-none whitespace-nowrap">{event.category}</p>

                        {/* Rating Display */}
                        {event.rating ? (
                            <div className="flex items-center gap-1">
                                <Star className="size-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-medium">
                                    {event.rating.toFixed(1)}
                                </span>
                                {event.userRatingCount ? (
                                    <span className="text-xs text-gray-500">
                                        ({event.userRatingCount.toLocaleString()})
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-500">
                                        (Unknown)
                                    </span>
                                )}
                            </div>
                        ) : (
                            event.rating === null && (
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-gray-500">
                                        (No ratings found)
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {/* Chevron button (only shown if reviews exist) */}
                    {hasReviews && (
                        <button
                            onClick={toggleExpand}
                            className="group p-2 mr-2 text-red-400"
                            aria-label={expanded ? "Collapse reviews" : "Expand reviews"}
                        >
                            {expanded ? <ChevronUp size={20} className="group-hover:text-red-400 group-hover:scale-120 transition"/> : <ChevronDown size={20} className="group-hover:text-red-400 group-hover:scale-120 transition"/>}
                        </button>
                    )}
                </div>

                {/* Reviews section (shown when expanded) */}
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            key="reviews"
                            initial={{ opacity: 0, y: -32, height: 0 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                height: "auto",
                                transition: {
                                    height: { delay: 0.07, duration: 0.3 },
                                    y: { delay: 0.35, duration: 0.3 },
                                    opacity: { delay: 0.35, duration: 0.3 }
                                }
                            }}
                            exit={{
                                opacity: 0, y: 32, height: 0,
                                transition: {
                                    y: { duration: 0.3 },
                                    opacity: { duration: 0.3 },
                                    height: { delay: 0.35, duration: 0.3 }
                                }
                            }}
                            className="p-4 overflow-hidden flex flex-col gap-3"
                        >
                            <h4 className="font-medium text-sm mb-2">Recent Reviews</h4>
                            {event.reviews ? (
                                event.reviews.slice(0, 5).map((review, index) => (
                                    <div key={index} className="bg-white p-3 rounded shadow-sm">
                                        <div className="flex items-center mb-1 gap-1">
                                            {review.rating && (
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`size-3 ${i <= Math.floor(review.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {review.relativePublishTimeDescription}
                                            </span>
                                        </div>
                                        {review.text && (
                                            <p className="text-sm">
                                                {review.text}
                                            </p>
                                        )}
                                        {review.authorAttribution && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                - {review.authorAttribution.displayName}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No reviews available for this location
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LazyLoad>
    );
}