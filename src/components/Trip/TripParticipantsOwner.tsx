import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "@/api/users";
import { useAuthStore } from "@/state/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type TripParticipantsOwnerProps = {
    ownerId: string;
}

export default function TripParticipantsOwner({ ownerId }: TripParticipantsOwnerProps) {
    const currentUser = useAuthStore((state) => state.user);

    const { data: owner, isLoading, isError } = useQuery({
        queryKey: ["user", ownerId],
        queryFn: () => fetchUserById({ uid: ownerId }),
    });

    if (isLoading) return <p>Loading owner details...</p>;
    if (isError) return <p>Error loading owner details</p>;

    return (
        <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-gray-300 shadow-md">
                <AvatarImage src={owner?.photoURL || ""} />
                <AvatarFallback>{owner?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col justify-center">
                <p className="text-lg font-semibold">
                    Hosted by {owner?.displayName || "Unknown"}
                    <span className="font-normal text-gray-500">
                        {currentUser?.uid === ownerId ? " (you)" : ""}
                    </span>
                </p>
                <p className="text-sm text-gray-400">0 trips together</p>
            </div>
        </div>
    );
}