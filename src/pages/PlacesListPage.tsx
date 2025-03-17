import PlaceCategoryFilter from "@/components/Place/PlaceCategoryFilter";
import PlacesGrid from "@/components/Place/PlacesGrid";
import SearchBar from "@/components/SearchBar";

export default function PlacesListPage() {
    return (
        <div className="w-screen min-h-screen bg-white text-black flex flex-col">
            <div className="h-auto w-screen border-b-2 border-gray-100">
                <SearchBar />
                <PlaceCategoryFilter />
            </div>
            <PlacesGrid />
        </div>
    );
}