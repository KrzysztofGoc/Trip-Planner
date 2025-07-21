import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
    updateUserDisplayName,
    updateUserPhoto,
    sendUserPasswordResetEmail,
    logoutUser,
} from "@/api/users";
import { useAuthStore } from "@/state/useAuthStore";
import { useMediaQuery } from "usehooks-ts";
import DesktopProfileLayout from "@/components/Profile/DesktopProfile";
import MobileProfileLayout from "@/components/Profile/MobileProfile";
import { useMutation } from "@tanstack/react-query";

export default function ProfilePage() {
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();
    const isDesktop = useMediaQuery("(min-width: 640px)");

    const [editingName, setEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(user?.photoURL || undefined);

    useEffect(() => {
        setDisplayName(user?.displayName || "");
        setSelectedAvatar(user?.photoURL || undefined);
    }, [user]);

    // Mutations
    const nameMutation = useMutation({
        mutationFn: updateUserDisplayName,
        onMutate: () => {
            const oldName = user?.displayName;
            setEditingName(false);
            return { oldName };
        },
        onSuccess: () => toast.success("Display name updated!"),
        onError: (_error, _data, context) => {
            toast.error("Failed to update name");

            const previousName = context?.oldName;
            if (previousName) {
                setDisplayName(previousName);
            }
        },
    });

    const avatarMutation = useMutation({
        mutationFn: updateUserPhoto,
        onSuccess: (_data, { url }) => {
            setSelectedAvatar(url);
            toast.success("Avatar updated!");
            setAvatarOpen(false);
        },
        onError: () => toast.error("Failed to update avatar"),
    });

    const resetMutation = useMutation({
        mutationFn: sendUserPasswordResetEmail,
        onSuccess: () => toast.success("Password reset email sent!"),
        onError: () => toast.error("Failed to send reset email"),
    });

    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            toast.success("Logged out");
        },
        onError: () => toast.error("Could not log out. Try again."),
    });

    useEffect(() => {
        if (user?.isAnonymous) {
            navigate('/login', { replace: true });
        }
    }, [user, navigate, logoutMutation]);

    function handleDisplayNameBlur() {
        if (displayName !== user?.displayName) {
            if (displayName.trim() === "") {
                toast.error("Name cannot be empty");
                setEditingName(false);
                setDisplayName(user?.displayName || "");
                return
            }
            nameMutation.mutate({ name: displayName.trim() });
        } else {
            setEditingName(false);
            setDisplayName(user?.displayName || "");
        }
    }

    function handleAvatarMutation({ url }: { url: string }) {
        setAvatarOpen(false);
        avatarMutation.mutate({ url: url })
    }

    function handlePopoverOpenChange(open: boolean) {
        if (!avatarMutation.isPending) {
            setAvatarOpen(open);
        }
    }

    function handleStartEdit() {
        if (!nameMutation.isPending) {
            setEditingName(true)
        }
    }

    const sharedProps = {
        user,
        editingName,
        displayName, setDisplayName,
        avatarOpen,
        selectedAvatar, setSelectedAvatar,
        nameMutation,
        avatarMutation,
        resetMutation,
        logoutMutation,
        handleDisplayNameBlur,
        handleAvatarMutation,
        handlePopoverOpenChange,
        handleStartEdit,
    };

    return isDesktop ? (
        <DesktopProfileLayout {...sharedProps} />
    ) : (
        <MobileProfileLayout {...sharedProps} />
    );
}
