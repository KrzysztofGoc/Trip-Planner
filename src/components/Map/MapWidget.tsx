import { useState } from "react";
import { Place } from "@/types/place";
import Map from "./Map";
import { TripEvent } from "@/types/tripEvent";
import dayjs from "dayjs";
import MapDayButton from "./MapDayButton";

type MapWidgetProps =
    | { mode: "place"; place: Place }
    | { mode: "route"; events: TripEvent[]; startDate: Date | null; endDate: Date | null };

export default function MapWidget(props: MapWidgetProps) {
    const [selectedDay, setSelectedDay] = useState(0);

    if (props.mode === "place") {
        const { place } = props;
        return (
            <div className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white border-b-4 border-red-400">
                <div className="h-64 w-full">
                    <Map mode="place" place={place} />
                </div>
                <div className="w-full p-4 space-y-1">
                    <p className="text-lg font-semibold">{place.name}</p>
                    <p className="text-sm text-gray-600">{place.category}</p>
                    <p className="text-sm text-gray-500">{place.address}</p>
                </div>
            </div>
        );
    }

    if (props.mode === "route") {
        const { events, startDate, endDate } = props;
        const totalDays =
            startDate && endDate ? dayjs(endDate).diff(dayjs(startDate), "day") + 1 : 0;
        let filteredEvents: TripEvent[] = [];

        if (selectedDay === 0) {
            filteredEvents = events;
        } else if (startDate) {
            const dayStart = dayjs(startDate).add(selectedDay - 1, "day").startOf("day");
            filteredEvents = events.filter(ev => dayjs(ev.from).isSame(dayStart, "day"));
        }

        return (
            <div className="border-b-2 border-gray-200 pb-8">
                <div className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white border-b-4 border-red-400">
                    {/* Map */}
                    <div className="h-64 w-full">
                        <Map mode="route" events={filteredEvents} />
                    </div>
                    {/* Info and Day Picker */}
                    <div className="w-full p-4 space-y-4">
                        <p className="text-lg font-semibold text-center">
                            {filteredEvents.length === 0
                                ? (selectedDay === 0
                                    ? "No events for this trip"
                                    : `No events for day ${selectedDay}`)
                                : selectedDay === 0
                                    ? `Trip route: ${filteredEvents.length} stop${filteredEvents.length === 1 ? "" : "s"}`
                                    : `Day ${selectedDay} route: ${filteredEvents.length} stop${filteredEvents.length === 1 ? "" : "s"}`
                            }
                        </p>
                        {(startDate === null || endDate === null) ? (
                            <p className="text-gray-400 text-sm text-center">
                                No trip date range set
                            </p>
                        ) : (
                            <div className="overflow-x-auto scrollbar-hide w-full">
                                <div className="inline-flex gap-2 px-1 py-1 min-w-fit whitespace-nowrap">
                                    <MapDayButton
                                        selected={selectedDay === 0}
                                        onClick={() => setSelectedDay(0)}
                                    >
                                        Whole trip
                                    </MapDayButton>
                                    {[...Array(totalDays)].map((_, idx) => (
                                        <MapDayButton
                                            key={idx + 1}
                                            selected={selectedDay === idx + 1}
                                            onClick={() => setSelectedDay(idx + 1)}
                                        >
                                            Day {idx + 1}
                                        </MapDayButton>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
