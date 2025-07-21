import SearchBar from "@/components/SearchBar";
import TripsGrid from "@/components/Trip/TripsGrid";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import DesktopNavigation from "@/components/DesktopNavigation";

export default function TripsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);

    return (
        <div>
            <div className="w-full flex flex-col items-center border-b-2 border-gray-100 sticky top-0 bg-white">
                {/* Top Nav (md+) */}
                <DesktopNavigation />

                <div className="h-auto w-full pb-5 pt-3 px-6 md:px-10 lg:px-20 max-w-screen-lg flex items-center justify-center">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search your trips…"
                    />
                </div>
            </div>
            <div className="w-full max-w-screen-xl mx-auto md:px-10 lg:px-20 bg-white text-black flex flex-col pb-20 md:pb-8">
                <TripsGrid search={debouncedSearch} />
            </div>
        </div>

    );
}
