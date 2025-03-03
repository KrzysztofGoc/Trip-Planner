import { Plus, UserRound, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink, Link } from "react-router-dom";

export default function MainNavigation() {

    const navButtonStyle = (isActive: boolean) =>
        `flex flex-col items-center justify-end w-3/4 h-14.5 transition-[color] ${isActive ? "text-red-400 stroke" : ""}`;

    return (
        /* Mobile Navigation */
        <div className="fixed bottom-0 left-0 w-full bg-white text-gray-500 grid grid-cols-3 justify-items-center items-center px-3 pb-4 border-t-1 border-t-gray-300">

            {/* Trips Button */}
            <NavLink to="/trips" className={({ isActive }) => navButtonStyle(isActive)}>
                <Plane className="size-6 stroke-current" />
                <span className="size-auto">
                    Trips
                </span>
            </NavLink>

            <div className="relative flex justify-center size-full">
                {/* Add Trip Button */}
                <Button className="flex flex-col absolute -top-5 bg-red-400 rounded-full size-16 border-gray-50 border-0 shadow-2xl">
                    <Link to="/trips/new">
                        <Plus className="size-6" />
                    </Link>
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