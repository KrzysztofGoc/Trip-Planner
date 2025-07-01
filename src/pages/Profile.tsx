import { useAuthStore } from "@/state/useAuthStore";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProfilePage() {
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (!user) {
        // Optionally: show a loading spinner while redirecting
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center p-12">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <div className="mb-6">
                <div className="font-semibold">Name:</div>
                <div>{user.displayName || user.email || "No name set"}</div>
            </div>
            <Button className="w-40" onClick={handleLogout}>
                Log out
            </Button>
        </div>
    );
}
