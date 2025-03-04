
import SearchBar from "@/components/SearchBar";
import TripsGrid from "@/components/TripsGrid";

export default function TripsPage() {

    return (
        <div className="w-screen h-screen bg-white text-black flex flex-col">
            <SearchBar />
            <TripsGrid />
        </div>
    );
}