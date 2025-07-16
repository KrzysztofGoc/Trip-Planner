import { useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import PlaceCategoryFilter from "@/components/Place/PlaceCategoryFilter";
import PlacesGrid from "@/components/Place/PlacesGrid";
import { useDebounce } from "use-debounce";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlacesListPage() {
  const { tripId } = useParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);

  const [debouncedSearch] = useDebounce(search, 600);
  const [debouncedCategory] = useDebounce(category, 600);

  return (
    <div className="w-screen min-h-screen bg-white text-black flex flex-col pb-4">
      <div className="h-auto w-screen border-b-2 border-gray-100 flex flex-col">
        <div className="flex items-center pb-5 pt-3 pr-6 pl-4 gap-5">
          <Link
            to={tripId ? `/trips/${tripId}` : "/trips"}
            className="size-12 flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Back to trip"
          >
            <ArrowLeft className="size-7 text-black" />
          </Link>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search for places..."
          />
        </div>
        <PlaceCategoryFilter value={category} onChange={setCategory} />
      </div>
      {tripId && (
        <PlacesGrid
          search={debouncedSearch}
          category={debouncedCategory}
        />
      )}
    </div>
  );
}
