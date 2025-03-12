import { PlusCircle } from "lucide-react";

export default function TimelineAddEventButton() {
    return (
        <button
            className="relative flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg shadow-md bg-gray-50"
        >
            <PlusCircle className="size-6 text-red-400" />
            <span className="text-sm font-medium">Add Event</span>


        </button>
    );
}