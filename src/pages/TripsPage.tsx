
import SearchBar from "@/components/SearchBar";
import TripsGrid from "@/components/Trip/TripsGrid";
import { useState } from "react";
import { useDebounce } from "use-debounce";

export default function TripsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);

    return (
        <div className="w-screen min-h-screen bg-white text-black flex flex-col pb-20">
            <div className="h-auto w-screen border-b-2 border-gray-100 pb-5 pt-3 px-6">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search your trips…"
                />
            </div>
            <TripsGrid search={debouncedSearch} />
        </div>
    );
}