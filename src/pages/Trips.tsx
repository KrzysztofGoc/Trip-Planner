import { useQuery } from "@tanstack/react-query";
import { fetchTrips } from "@/api/trips";
import SearchBar from "@/components/SearchBar";

export default function TripsPage() {
    const {data, isLoading, isError, error} = useQuery({
        queryFn: fetchTrips,
        queryKey: ["trips"],
    });

    if (isError) {
        return <p>{error.message}</p>
    }

    if (isLoading) {
        return <p>Loading trips...</p>
    } 

    return (
        <div className="w-screen h-screen bg-white text-black flex flex-col">
            <SearchBar />
        </div>
    );
}