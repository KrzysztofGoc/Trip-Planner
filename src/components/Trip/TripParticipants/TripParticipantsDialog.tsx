import { useState, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Users, Pencil, ChevronRight } from "lucide-react";
import { Participant } from "@/types/participant";
import { searchUsers } from "@/api/users";
import { removeParticipantFromTrip, addParticipantToTrip } from "@/api/trips";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/api/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import UniversalLoader from "@/components/LoadingSpinner";
import TripParticipantsAvatarRow from "./TripParticipantsAvatarRow";
import { useResizeObserver } from "usehooks-ts";

interface TripParticipantsGridProps {
  participants: Participant[];
  tripId: string | undefined;
  isOwner: boolean;
  ownerId: string;
}

export default function TripParticipantsDialog({ participants, tripId, isOwner, ownerId }: TripParticipantsGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { width: triggerWidth = 0 } = useResizeObserver({ ref: triggerRef, box: "border-box" });

  // Only needed for owner, but doesn't harm to include always (simplifies conditional)
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["searchUsers", debouncedSearch, tripId],
    queryFn: () => searchUsers({ query: debouncedSearch, tripId }),
    enabled: isOwner && debouncedSearch.length > 0,
    throwOnError: true,
  });

  const { mutate: removeUser } = useMutation({
    mutationFn: removeParticipantFromTrip,
    onMutate: async ({ uid }) => {
      toast.success("Removed participant", { id: "remove-participant" });

      await queryClient.cancelQueries({ queryKey: ["trips", { tripId }, "participants"] });

      // Snapshot previous participants
      const previousParticipants = queryClient.getQueryData<Participant[]>(["trips", { tripId }, "participants"]);

      // Optimistically update cache
      if (previousParticipants) {
        queryClient.setQueryData(["trips", { tripId }, "participants"],
          previousParticipants.filter(p => p.uid !== uid)
        );
      }

      return { previousParticipants };
    },
    onError: (_err, _data, context) => {
      toast.error("Failed to remove participant", { id: "remove-participant" });
      if (context?.previousParticipants) {
        queryClient.setQueryData(["trips", { tripId }, "participants"], context.previousParticipants);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", { tripId }, "participants"] });
    },
  });

  const { mutate: addUser } = useMutation({
    mutationFn: addParticipantToTrip,
    onMutate: async ({ participant }) => {
      toast.success("Added participant", { id: "add-participant" });

      await queryClient.cancelQueries({ queryKey: ["trips", { tripId }, "participants"] });

      // Snapshot previous
      const previousParticipants = queryClient.getQueryData<Participant[]>(["trips", { tripId }, "participants"]);
      if (previousParticipants) {
        queryClient.setQueryData(["trips", { tripId }, "participants"], [
          ...previousParticipants,
          participant,
        ]);
      }
      return { previousParticipants };
    },
    onError: (_err, _data, context) => {
      toast.error("Failed to add participant", { id: "add-participant" });
      if (context?.previousParticipants) {
        queryClient.setQueryData(["trips", { tripId }, "participants"], context.previousParticipants);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", { tripId }, "participants"] });
    },
  });

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setSearch("");
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <div ref={triggerRef} className="flex flex-col gap-4 transition rounded-xl px-2 py-2 w-full">
          {/* Participants label */}
          <div className="flex flex-col gap-4 group w-fit cursor-pointer">
            <div className="flex items-center gap-5.5">
              <Users className="size-6 w-12" />
              <p className="text-lg font-semibold">Participants</p>
              {isOwner && <Pencil className="w-5 h-5 text-red-400 -ml-2 group-hover:scale-120 transition" />}
              {!isOwner && <ChevronRight className="size-5 text-red-400 -ml-2 group-hover:scale-130 transition" />}
            </div>

            {/* Responsive Participants list */}
            <TripParticipantsAvatarRow participants={participants} containerWidth={triggerWidth}/>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-8">
        <DialogHeader>
          <DialogTitle>{isOwner ? "Manage Participants" : "Participants"}</DialogTitle>
        </DialogHeader>
        {/* Current Participants */}
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Current participants:</p>

          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground border rounded bg-gray-50">
              <Users className="w-10 h-10 text-gray-300" />
              <span className="font-semibold text-gray-500">No participants yet</span>
            </div>

          ) : (
            <div className="flex flex-col gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.uid}
                  className="flex items-center gap-2 border rounded p-2"
                >
                  <Avatar className="size-8 border">
                    <AvatarImage src={participant.photoURL || undefined} />
                    <AvatarFallback>{participant.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>
                    {participant.displayName}
                    {participant.uid === ownerId && (
                      <span className="ml-1 text-xs font-semibold text-red-400">(Owner)</span>
                    )}
                  </span>
                  {isOwner && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto"
                      title="Remove participant"
                      disabled={participant.uid === ownerId}
                      onClick={() => removeUser({ tripId: tripId, uid: participant.uid })}
                    >
                      <Trash2 className={`size-4 ${participant.uid === ownerId ? " text-gray-300" : " text-red-500"}`

                      } />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Search Bar and Add Participants -- only for owners */}
        {isOwner && (
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Search for participants:</p>
            <Input
              className="w-full p-2 border rounded"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users to add..."
            />
            {isSearching && (
              <UniversalLoader label="Searching for users..." />
            )}
            {!isSearching && debouncedSearch.length > 0 && (
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((user) => {
                    const alreadyParticipant = participants.some(p => p.uid === user.uid);
                    return (
                      <div
                        key={user.uid}
                        className="flex items-center gap-2 border rounded p-2"
                      >
                        <Avatar className="size-8 border">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.displayName}</span>
                        <Button
                          size="sm"
                          className="ml-auto bg-red-400 text-white rounded-lg"
                          disabled={alreadyParticipant}
                          onClick={() => addUser({ tripId: tripId, participant: user })}
                        >
                          {alreadyParticipant ? "Added" : "Add"}
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 px-1 pt-2">No users found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
