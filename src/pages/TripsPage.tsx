
import SearchBar from "@/components/SearchBar";
import TripsGrid from "@/components/Trip/TripsGrid";
import { useState } from "react";
import { useDebounce } from "use-debounce";

export default function TripsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);

    return (
        <div className="w-full max-w-screen-xl mx-auto md:px-10 lg:px-20 bg-white text-black flex flex-col pb-20 md:pb-8">
            <div className="h-auto w-auto border-b-2 border-gray-100 pb-5 pt-3 px-6">
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