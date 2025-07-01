import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuthStore } from "@/state/useAuthStore";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const setLoading = useAuthStore(s => s.setLoading);
    const navigate = useNavigate();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/trips")
            // onAuthStateChanged will update the store
        } catch (err) {
            alert("Login failed");
            console.log(err);
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleRegister} className="flex flex-col">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
                <button type="submit">Register</button>
            </form>
            <br />
            <Link to={"/login"}>
                <p>Already have an account? <span className="font-bold">Login</span></p>
            </Link>
        </>
    );
}
