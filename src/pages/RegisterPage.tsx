import { useState, useEffect } from "react";
import { linkWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";
import { useAuthStore } from "@/state/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { auth } from "@/firebase";  // Import Firebase auth

export default function RegisterPage() {
    const user = useAuthStore(s => s.user);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState(""); // Add state for nickname
    const setLoading = useAuthStore(s => s.setLoading);
    const navigate = useNavigate();

    // Redirect to /account if the user is already logged in and not anonymous
    useEffect(() => {
        if (!user?.isAnonymous) {
            navigate("/account");
        }
    }, [navigate, user]);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (user?.isAnonymous) {
                // Create a credential for the email/password account
                const credential = EmailAuthProvider.credential(email, password);

                // Link the anonymous account with the new email/password credentials
                await linkWithCredential(user, credential);

                if (auth.currentUser) {
                    // Update the user's profile with the nickname (displayName)
                    await updateProfile(auth.currentUser, {
                        displayName: nickname,
                    });
                }

                setLoading(false);
                navigate("/trips");
            }
        } catch (err) {
            toast.error(`Registration failed: ${err}`);
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleRegister} className="flex flex-col">
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                />
                <input
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="Nickname"
                />
                <button type="submit">Register</button>
            </form>
            <br />
            <Link to={"/login"}>
                <p>Already have an account? <span className="font-bold">Login</span></p>
            </Link>
        </>
    );
}
