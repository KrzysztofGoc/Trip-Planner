import { functions } from "@/firebase";
import { Participant } from "@/types/participant";
import { httpsCallable } from "firebase/functions";

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