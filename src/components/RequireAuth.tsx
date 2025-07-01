import { useAuthStore } from "@/state/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export function RequireAuth() {
    const user = useAuthStore(s => s.user);
    const loading = useAuthStore(s => s.loading);

    // Optionally show spinner while loading
    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!user) {
        // Not logged in: redirect to login (preserve intended URL)
        return <Navigate to="/login" replace />;
    }

    // Authenticated: show nested route
    return <Outlet />;
}
