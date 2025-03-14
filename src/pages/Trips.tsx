
import SearchBar from "@/components/SearchBar";
import TripsGrid from "@/components/TripsGrid";

export default function TripsPage() {

    return (
        <div className="w-screen min-h-screen bg-white text-black flex flex-col">
            <div className="h-auto w-screen border-b-2 border-gray-100">
                <SearchBar />
            </div>
            <TripsGrid />
        </div>
    );
}