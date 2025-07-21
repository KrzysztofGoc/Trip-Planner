import {
    Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Loader2, LogOut, Camera, Pencil } from "lucide-react";
import { AVATAR_PRESETS } from "@/constants/userImages";
import { auth } from "@/firebase";

export default function MobileProfileLayout(props) {
    const {
        user, editingName, displayName, setDisplayName,
        avatarOpen, selectedAvatar, nameMutation, avatarMutation,
        resetMutation, logoutMutation,
        handleDisplayNameBlur, handleAvatarMutation, handlePopoverOpenChange, handleStartEdit
    } = props;

    // (Copy/paste your existing layout here, replacing state calls as above)
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                <CardHeader className="flex flex-col items-center pt-8 pb-2">
                    {/* Avatar edit with popover */}
                    <Popover open={avatarOpen} onOpenChange={handlePopoverOpenChange}>
                        <PopoverTrigger asChild>
                            <button className="relative" aria-label="Change avatar">
                                <Avatar className="size-20 shadow-lg mb-2">
                                    <AvatarImage src={selectedAvatar || undefined} />
                                    <AvatarFallback>
                                        {(user?.displayName?.[0] || "U").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {!avatarMutation.isPending && (
                                    <Camera className="absolute bottom-1 right-0 bg-white rounded-full p-1 text-red-400 w-7 h-7 shadow" />
                                )}
                                {/* Loader overlay */}
                                {avatarMutation.isPending && (
                                    <div className="absolute inset-0 aspect-square shrink-0 bg-white/70 rounded-full flex items-center justify-center z-10">
                                        <Loader2 className="shrink-0 animate-spin w-8 h-8 text-red-400" />
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

                    {/* Editable Display Name */}
                    <div className="flex items-center gap-2 w-full justify-center">
                        {editingName ? (
                            <>
                                <Input
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    onBlur={handleDisplayNameBlur}
                                    className="text-lg font-bold h-12 max-w-[220px]"
                                    disabled={nameMutation.isPending}
                                    maxLength={30}
                                    autoFocus
                                    aria-label="Edit display name"
                                />
                            </>
                        ) : (
                            <div
                                className="flex justify-center items-center"
                                onClick={handleStartEdit}
                                aria-label="Edit display name"
                            >
                                <Button
                                    size="default"
                                    variant="ghost"
                                    disabled={nameMutation.isPending}
                                >
                                    <CardTitle className="text-2xl font-bold py-2">
                                        {displayName}
                                    </CardTitle>
                                </Button>
                                {nameMutation.isPending ? (
                                    <Loader2 className="animate-spin text-red-400 size-5 shrink-0" />
                                ) : (
                                    <Pencil className="size-5 text-red-400" />
                                )}
                            </div>
                        )}
                    </div>


                    <div className="text-gray-500 text-sm">
                        {user?.email || "No email set"}
                    </div>

                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 pb-8">
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-semibold"
                        onClick={() => resetMutation.mutate({ email: user?.email })}
                        disabled={resetMutation.isPending}
                    >
                        {resetMutation.isPending ? (
                            <><Loader2 className="animate-spin w-5 h-5 mr-2" /> Sending reset...</>
                        ) : "Change password"}
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full h-12 text-base font-semibold flex items-center gap-2"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending || !auth.currentUser}
                    >
                        {/* Check both isPending and current user there because before authStore updates and triggers redirect the UI enables for a second  */}
                        {(logoutMutation.isPending || !auth.currentUser) ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Logging out...
                            </>
                        ) : (
                            <>
                                <LogOut className="w-5 h-5" />
                                Log out
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
