import { useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import PlaceCategoryFilter from "@/components/Place/PlaceCategoryFilter";
import PlacesGrid from "@/components/Place/PlacesGrid";
import { useDebounce } from "use-debounce";

export default function PlacesListPage() {
  const { tripId } = useParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);

  const [debouncedSearch] = useDebounce(search, 600);
  const [debouncedCategory] = useDebounce(category, 600);

  return (
    <div className="w-screen min-h-screen bg-white text-black flex flex-col">
      <div className="h-auto w-screen border-b-2 border-gray-100">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={setSearch}
          placeholder="Search for places..."
        />
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
