import DesktopNavigation from "@/components/DesktopNavigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Pencil } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { AVATAR_PRESETS } from "@/constants/userImages"
import { auth } from "@/firebase"
import { LogOut } from "lucide-react"

// Props passed in as before (just spread them down from ProfilePage)
export default function DesktopProfileLayout(props) {
    const {
        user, editingName, displayName, setDisplayName,
        avatarOpen, selectedAvatar, nameMutation, avatarMutation,
        resetMutation, logoutMutation,
        handleDisplayNameBlur, handleAvatarMutation, handlePopoverOpenChange, handleStartEdit
    } = props;

    return (
        <div className="min-h-screen bg-white w-full">
            <div className="border-b-1">
                <DesktopNavigation />
            </div>

            {/* Main profile area */}
            <div className="w-full flex flex-col items-center px-6 md:px-10 lg:px-20">
                <div className="w-full max-w-screen-xl flex flex-col items-stretch gap-8 pt-12  md:flex-row md:items-center md:gap-16 border-b-1 pb-12">

                    {/* Left: Avatar & name */}
                    <div className="flex flex-col items-center bg-white rounded-2xl shadow-2xl shadow-black/20 border-1 px-10 py-8 gap-3 w-full md:max-w-xs ">
                        {/* Avatar + Edit */}
                        <Popover open={avatarOpen} onOpenChange={handlePopoverOpenChange}>
                            <PopoverTrigger asChild>
                                <button className="relative group" aria-label="Change avatar">
                                    <Avatar className="size-28 shadow-md">
                                        <AvatarImage src={selectedAvatar || undefined} />
                                        <AvatarFallback>
                                            {(user?.displayName?.[0] || "U").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Edit icon */}
                                    {!avatarMutation.isPending && (
                                        <Camera className="absolute bottom-1 right-0 bg-white rounded-full p-1 text-red-400 w-8 h-8 shadow group-hover:scale-110 transition" />
                                    )}
                                    {avatarMutation.isPending && (
                                        <div className="absolute inset-0 aspect-square bg-white/70 rounded-full flex items-center justify-center z-10">
                                            <Loader2 className="animate-spin w-10 h-10 text-red-400" />
                                        </div>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 grid grid-cols-3 gap-2">
                                {AVATAR_PRESETS.map((avatar) => (
                                    <button
                                        key={avatar.key}
                                        onClick={() => handleAvatarMutation({ url: avatar.url })}
                                        className={`border-2 rounded-full size-20 overflow-hidden ${selectedAvatar === avatar.url ? "border-red-400" : "border-transparent"} focus:outline-none`}
                                        disabled={avatarMutation.isPending}
                                    >
                                        <img src={avatar.url} alt="Avatar" className="object-cover" />
                                    </button>
                                ))}
                            </PopoverContent>
                        </Popover>

                        {/* Display Name + Edit */}
                        <div className="flex items-center gap-2 mt-2">
                            {editingName ? (
                                <input
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    onBlur={handleDisplayNameBlur}
                                    className="text-2xl font-bold h-12 px-2 border rounded-md max-w-[220px] focus:outline-none"
                                    disabled={nameMutation.isPending}
                                    maxLength={30}
                                    autoFocus
                                    aria-label="Edit display name"
                                />
                            ) : (
                                <div
                                    className="flex items-center cursor-pointer group"
                                    onClick={handleStartEdit}
                                    aria-label="Edit display name"
                                >
                                    <span className="text-2xl font-bold group-hover:underline">
                                        {displayName}
                                    </span>
                                    {nameMutation.isPending ? (
                                        <Loader2 className="animate-spin text-red-400 size-5 ml-2" />
                                    ) : (
                                        <Pencil className="size-5 text-red-400 ml-2" />
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Subtitle/email */}
                        <div className="text-gray-500 text-base">
                            {user?.email || "Guest"}
                        </div>
                    </div>

                    {/* Right: Actions + complete your profile (optional) */}
                    <div className="flex flex-col gap-8 flex-1 pt-4 md:pt-8">

                        {/* Actions */}
                        <div className="flex flex-col gap-3 md:max-w-lg sm:px-16">
                            <Button
                                variant="outline"
                                className="h-12 text-base font-semibold"
                                onClick={() => resetMutation.mutate({ email: user?.email })}
                                disabled={resetMutation.isPending}
                            >
                                {resetMutation.isPending ? (
                                    <><Loader2 className="animate-spin w-5 h-5 mr-2" /> Sending reset...</>
                                ) : "Change password"}
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-12 text-base font-semibold flex items-center gap-2"
                                onClick={() => logoutMutation.mutate()}
                                disabled={logoutMutation.isPending || !auth.currentUser}
                            >
                                {(logoutMutation.isPending || !auth.currentUser) ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5 mr-2" /> Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="size-5"/> Log out
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
