import EventCategoryFilter from "@/components/EventCategoryFilter";
import EventsGrid from "@/components/EventsGrid";
import SearchBar from "@/components/SearchBar";
import { useParams } from "react-router-dom";

export default function NewEventPage() {
    const { tripId, dayId } = useParams();

    return (
        <div className="w-screen min-h-screen bg-white text-black flex flex-col">
            <div className="h-auto w-screen border-b-2 border-gray-100">
                <SearchBar />
                <EventCategoryFilter />
            </div>
            <EventsGrid />
        </div>
    );
}