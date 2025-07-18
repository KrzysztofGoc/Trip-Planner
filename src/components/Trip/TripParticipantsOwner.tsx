import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "@/api/users";
import { useAuthStore } from "@/state/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { fetchTripsTogetherCount } from "@/api/trips";
import UniversalLoader from "../LoadingSpinner";

type TripParticipantsOwnerProps = {
    ownerId: string;
}

export default function TripParticipantsOwner({ ownerId }: TripParticipantsOwnerProps) {
    const currentUser = useAuthStore((state) => state.user);

    const { data: owner, isLoading } = useQuery({
        queryKey: ["user", ownerId],
        queryFn: () => fetchUserById({ uid: ownerId }),
    });

    const { data: tripsTogether, isLoading: loadingTripsTogether, isError: errorTripsTogether, } = useQuery({
        queryKey: ["trips-together", currentUser?.uid, ownerId],
        queryFn: () => {
            return fetchTripsTogetherCount({ currentUserUid: currentUser?.uid, otherUserUid: ownerId });
        },
        enabled: !!currentUser?.uid && !!ownerId && currentUser.uid !== ownerId,
    });

    if (isLoading || loadingTripsTogether) return <UniversalLoader label="Loading owner details..."/>;

    return (
        <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-gray-300 shadow-md">
                <AvatarImage src={owner?.photoURL || undefined} />
                <AvatarFallback>{owner?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col justify-center">
                <p className="text-lg font-semibold">
                    Hosted by {owner?.displayName || "Unknown"}
                    <span className="font-normal text-gray-500">
                        {currentUser?.uid === ownerId ? " (you)" : ""}
                    </span>
                </p>
                {(currentUser?.uid !== ownerId && tripsTogether !== undefined) && (
                    errorTripsTogether ? (
                        <p className="text-sm text-red-400">Could not load trips together</p>
                    ) : (
                        <p className="text-sm text-gray-400">
                            {tripsTogether} trip{tripsTogether === 1 ? "" : "s"} together
                        </p>
                    )
                )}
            </div>
        </div>
    );
}