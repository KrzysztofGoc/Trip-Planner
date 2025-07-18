import { functions } from "@/firebase";
import { Participant } from "@/types/participant";
import { httpsCallable } from "firebase/functions";
import { signInWithEmailAndPassword, EmailAuthProvider, updateProfile, linkWithCredential, User, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "@/firebase";

type fetchUserByIdProps = {
    uid: string,
}

type fetchUserByIdReturn = {
    displayName: string,
    photoURL: string,
}

export const fetchUserById = async ({ uid }: fetchUserByIdProps) => {
    const getUserData = httpsCallable<fetchUserByIdProps, fetchUserByIdReturn>(functions, 'getUserData');

    const result = await getUserData({ uid: uid });
    return result.data;
};

type SearchUsersArgs = {
    query: string;
    tripId: string | undefined;
};

export async function searchUsers({ query, tripId }: SearchUsersArgs) {
    if (!tripId) throw new Error("Trip ID is missing");

    const fn = httpsCallable<SearchUsersArgs, Participant[]>(functions, "searchUsers");
    const result = await fn({ query, tripId });
    return result.data;
}

type LoginUserProps = {
    login: string,
    password: string,
};

export const loginUser = async ({ login, password }: LoginUserProps) => {
    await signInWithEmailAndPassword(auth, login, password);
};

type RegisterUserArgs = {
    email: string;
    password: string;
    nickname: string;
    user: User | null;
};

export async function registerUser({ email, password, nickname, user }: RegisterUserArgs) {
    if (!user) {
        throw new Error("User not found.");
    }
    if (!user.isAnonymous) {
        throw new Error("User already logged in.");
    }

    // Link anonymous user with provided credentials
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);

    if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            displayName: nickname,
        });
    }
}

type UpdateUserDisplayNameProps = {
    name: string
};

export async function updateUserDisplayName({ name }: UpdateUserDisplayNameProps) {
    if (!auth.currentUser) throw new Error("Not logged in");

    await updateProfile(auth.currentUser, { displayName: name.trim() });
}

type UpdateUserPhotoProps = {
    url: string
};

export async function updateUserPhoto({ url }: UpdateUserPhotoProps) {
    if (!auth.currentUser) throw new Error("Not logged in");
    await updateProfile(auth.currentUser, { photoURL: url });
}

type SendUserPasswordResetEmailProps = {
    email: string | null | undefined;
};

export async function sendUserPasswordResetEmail({ email }: SendUserPasswordResetEmailProps) {
    if (!email) throw new Error("No email set");
    await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
    await signOut(auth);
}