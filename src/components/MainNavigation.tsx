import { Plus, UserRound, Plane, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createTrip } from "@/api/trips";
import { toast } from "sonner";
import { useAuthStore } from "@/state/useAuthStore";

export default function MainNavigation() {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user); // Get the current user from Zustand state

    const { mutate: handleCreateTrip, isPending } = useMutation({
        mutationFn: createTrip,
        onMutate: () => {
            toast.loading("Creating trip...", { id: "create-trip" });
        },
        onSuccess: (tripId) => {
            toast.success("Trip created!", { id: "create-trip" });
            navigate(`/trips/${tripId}`);
        },
        onError: () => {
            toast.error("Failed to create trip", {
                id: "create-trip"
            });
        }
    });

    // Function to handle adding a trip
    function handleAddTrip() {
        if (!user) {
            toast.error("You must be logged in to add a trip.");
            navigate("/login");
            return;
        }
        handleCreateTrip();
    }

    const navButtonStyle = (isActive: boolean) =>
        `flex flex-col items-center justify-end w-3/4 h-14.5 transition-[color] ${isActive ? "text-red-400" : ""}`;


    return (
        /* Mobile Navigation */
        <div className="fixed z-50 bottom-0 left-0 w-full bg-white text-gray-500 grid grid-cols-3 justify-items-center items-center px-3 pb-4 border-t-1 border-t-gray-200 sm:hidden">

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

            {/* User Button: Login if not logged in anonymously, Profile if logged in */}
            {user ? (
                user.isAnonymous ? (
                    // If the user is logged in anonymously, show Login button
                    <NavLink to="/login" className={({ isActive }) => navButtonStyle(isActive)}>
                        <LogIn className="size-6 stroke-current" />
                        <span>
                            Login
                        </span>
                    </NavLink>
                ) : (
                    // If the user is logged in (not anonymously), show Profile button
                    <NavLink to="/account" className={({ isActive }) => navButtonStyle(isActive)}>
                        <UserRound className="size-6 stroke-current" />
                        <span>
                            Profile
                        </span>
                    </NavLink>
                )
            ) : (
                // If the user is not logged in at all, show Login button
                <NavLink to="/login" className={({ isActive }) => navButtonStyle(isActive)}>
                    <LogIn className="size-6 stroke-current" />
                    <span>
                        Login
                    </span>
                </NavLink>
            )}
        </div>
    )
}
