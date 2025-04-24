import { Plus, UserRound, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createTrip } from "@/api/trips";
import { toast } from "sonner";

export default function MainNavigation() {
    const navigate = useNavigate();

    const { mutate: handleCreateTrip, isPending } = useMutation({
        mutationFn: createTrip,
        onMutate: () => {
            toast.loading("Creating trip...", { id: "create-trip" });
        },
        onSuccess: (trip) => {
            toast.success("Trip created!", { id: "create-trip" });
            navigate(`/trips/${trip.id}`);
        },
        onError: (err) => {
            toast.error("Failed to create trip", {
                description: err instanceof Error ? err.message : String(err),
                id: "create-trip"
            });
        }
    });

    function handleAddTrip() {
        handleCreateTrip();
    }

    const navButtonStyle = (isActive: boolean) =>
        `flex flex-col items-center justify-end w-3/4 h-14.5 transition-[color] ${isActive ? "text-red-400 stroke" : ""}`;

    return (
        /* Mobile Navigation */
        <div className="fixed z-999 bottom-0 left-0 w-full bg-white text-gray-500 grid grid-cols-3 justify-items-center items-center px-3 pb-4 border-t-1 border-t-gray-200">

            {/* Trips Button */}
            <NavLink to="/trips" className={({ isActive }) => navButtonStyle(isActive)}>
                <Plane className="size-6 stroke-current" />
                <span className="size-auto">
                    Trips
                </span>
            </NavLink>

            <div className="relative flex justify-center size-full">
                {/* Add Trip Button */}
                <Button
                    onClick={handleAddTrip}
                    disabled={isPending}
                    className="flex flex-col items-center justify-center absolute -top-5 bg-red-400 rounded-full size-16 border-gray-50 border-0 shadow-2xl"
                >
                    <Plus className="size-6 text-white" />
                </Button>
            </div>

            {/* User Profile Button */}
            <NavLink to="/profile" className={({ isActive }) => navButtonStyle(isActive)}>
                <UserRound className="size-6 stroke-current" />
                <span>
                    Profile
                </span>
            </NavLink>

        </div>
    )
}