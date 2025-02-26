import { PlusCircle, User, Luggage } from "lucide-react";
import { Button } from "./ui/button";

export default function MainNavigation() {

    return (
        /* Mobile Navigation */
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4">
            <div className="grid grid-cols-3 gap-4">

                {/* Trips Button */}
                <Button variant="ghost"> 
                    <Luggage /> 
                    Trips
                </Button>

                {/* Add Trip Button */}
                <Button variant="ghost" > 
                    <PlusCircle /> 
                    Add Trip
                </Button>

                {/* User Profile Button */}
                <Button variant="ghost" > 
                    <User /> 
                    Profile
                </Button>

            </div>
        </div>
    )
}