import { useAuthStore } from "@/state/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import UniversalLoader from "./LoadingSpinner";

export function RequireAuth() {
    const user = useAuthStore(s => s.user);
    const loading = useAuthStore(s => s.loading);

    // Optionally show spinner while loading
    if (loading) return <UniversalLoader label="Loading account..." fullscreen />;

    if (!user) {
        // Not logged in: redirect to login (preserve intended URL)
        return <Navigate to="/login" replace />;
    }

    // Authenticated: show nested route
    return <Outlet />;
}
