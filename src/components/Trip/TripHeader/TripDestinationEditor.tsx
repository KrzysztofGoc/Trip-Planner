import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateTripDestination } from "@/api/trips";
import { fetchPlaceSuggestions, PlaceSuggestion } from "@/api/places";
import { toast } from "sonner";
import { queryClient } from "@/api/queryClient";
import { Trip } from "@/types/trip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Pencil } from "lucide-react";
import { useDebounce } from "use-debounce";

interface TripDestinationEditorProps {
    destination: string | null;
    tripId: string | undefined;
}

export default function TripDestinationEditor({ destination, tripId, }: TripDestinationEditorProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 300);

    // Destination update mutation with optimistic UI
    const { mutate: mutateDestination } = useMutation({
        mutationFn: updateTripDestination,

        onMutate: async ({ tripId, destination }) => {
            // Optimistically confirm update to user
            toast.success("Trip destination updated", { id: "trip-destination-update" });

            // Cancel ongoing trip queries to avoid race conditions
            await queryClient.cancelQueries({ queryKey: ["trips", { tripId }] });

            // Snapshot previous data for rollback
            const previousTripData = queryClient.getQueryData<Trip>(["trips", { tripId }]);

            if (!previousTripData) {
                throw new Error("Cannot optimistically update: trip data is missing from cache");
            }

            // Update local cache optimistically
            const updatedTripData = { ...previousTripData, destination };
            queryClient.setQueryData(["trips", { tripId }], updatedTripData);

            // Return snapshot for rollback
            return { previousTripData };
        },

        onError: (error, _data, context) => {
            toast.error("Failed to update destination", { id: "trip-destination-update" });

            console.log(error);

            // Rollback cache on error
            const previousTripData = context?.previousTripData;
            if (previousTripData) {
                queryClient.setQueryData(["trips", { tripId }], previousTripData);
            }
        },

        // Ensure server state is refetched
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["trips", { tripId }] });
        },
    });

    // Query for suggestions based on user input
    const { data: suggestions, isLoading, isError } = useQuery({
        queryKey: ["place-suggestions", debouncedQuery],
        queryFn: () => fetchPlaceSuggestions(debouncedQuery),
        enabled: !!debouncedQuery,
    });

    function handleSelect(newDestination: PlaceSuggestion) {
        if (newDestination.label !== destination) {
            mutateDestination({ tripId, destination: newDestination.label, destinationId: newDestination.placeId });
            setOpen(false)
            setQuery("");
        } else {
            toast.error("New destination cannot be the same as previous one.", { id: "trip-destination-update" })
        }
    }

    function handleOpenChange(open: boolean) {
        setOpen(open);
        if (!open) {
            setQuery("");
        }
    }

    // Fallback for display
    const displayDestination =
        !destination || destination.trim() === ""
            ? <span className="text-gray-400 italic">Click to set a destination!</span>
            : destination;


    return (
        <Popover open={open} onOpenChange={(open) => handleOpenChange(open)}>
            <PopoverTrigger asChild>
                <div className="group flex items-center gap-2 cursor-pointer">
                    <p className="-ml-[1px] text-base text-gray-500 py-1">{displayDestination}</p>
                    <Pencil className="size-4 text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[300px] max-h-256 overflow-y-auto p-0"
                side="bottom"
                align="start"
                avoidCollisions={false}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search for a destination..."
                        value={query}
                        onValueChange={setQuery}
                        autoFocus
                    />
                    {debouncedQuery === "" && (
                        <div className="p-2 text-sm text-muted-foreground">Start typing to search</div>
                    )}
                    {suggestions?.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground">No locations found</div>
                    )}
                    {isLoading && (
                        <div className="p-2 text-sm text-muted-foreground">Loading locations...</div>
                    )}
                    {isError && (
                        <div className="p-2 text-sm font-semibold text-red-400">Error loading locations</div>
                    )}
                    {suggestions && suggestions.length > 0 && (
                        <CommandList>
                            {suggestions.map((suggestion) => (
                                <CommandItem
                                    key={suggestion.label}
                                    onSelect={() => handleSelect(suggestion)}
                                    value={suggestion.label}
                                >
                                    {suggestion.label}
                                </CommandItem>
                            ))}
                        </CommandList>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
