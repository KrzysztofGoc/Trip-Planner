import { useState, useEffect } from "react";
import { useAuthStore } from "@/state/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { loginAndTransferTripOwnership } from "@/api/trips";

export default function LoginPage() {
    const user = useAuthStore(s => s.user);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const setLoading = useAuthStore(s => s.setLoading);
    const navigate = useNavigate();

    // Mutation for trip ownership transfer and login
    const { mutate: loginAndMutateTransferTrips, isPending } = useMutation({
        mutationFn: loginAndTransferTripOwnership,
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: () => {
            toast.success("Trips transferred to your account.");
            setLoading(false);
            navigate("/trips");
        },
        onError: (err) => {
            toast.error("Could not transfer trips: " + err);
            setLoading(false);
            navigate("/trips");
        },
    });

    // Redirect to /account if the user is already logged in and not anonymous
    useEffect(() => {
        if (!user?.isAnonymous && !isPending) {
            navigate("/account");
        }
    }, [navigate, user, isPending]);

    async function handleLogin(e: React.FormEvent) {
        // After login, transfer ownership if coming from anonymous user
        e.preventDefault();
        loginAndMutateTransferTrips({ login: email, password });
    }

    return (
        <>
            <form onSubmit={handleLogin} className="flex flex-col">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
                <button type="submit" disabled={isPending}>Login</button>
            </form>
            <br />
            <Link to={"/register"}>
                <p>Don't have an account? <span className="font-bold">Register</span></p>
            </Link>
        </>
    );
}
