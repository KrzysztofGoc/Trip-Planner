import { useState } from "react";
import { useAuthStore } from "@/state/useAuthStore";
import { Button } from "./ui/button";
import { CloudAlert, X } from "lucide-react";

const WarningMessage = () => {
  const [status, setStatus] = useState<"dialog" | "icon" | "closed">("dialog"); // Default to showing icon
  const user = useAuthStore((state) => state.user);

  if (!user?.isAnonymous || status === "closed") {
    return null; // No warning for logged-in users
  }

  // Handle click to dismiss or toggle the dialog
  const handleDismiss = () => {
    setStatus("closed");
  };

  const handleShowDialog = () => {
    setStatus("dialog"); // Show the dialog
  };

  const handleShowIcon = () => {
    setStatus("icon"); // Set the state to "closed"
  };

  return (
    <>
      {/* Show the dialog when state is 'dialog' */}
      {status === "dialog" && (
        <div
          className="fixed bottom-35 w-auto right-4 left-4 bg-white text-black border-g-500 border-1 rounded-lg text-center p-4 z-50 shadow-lg flex flex-col gap-4 justify-center items-center"
        >
          <div className="flex items-center justify-center gap-4">
            <CloudAlert className="shrink-0 size-12 text-red-400" />
            <p className="text-center">
              You're using as a guest. You can create trips, but they will be lost after leaving unless you log in or register after.
            </p>
          </div>
          <Button
            onClick={handleShowIcon}
            className="w-24 h-12 bg-red-400 text-white rounded-lg"
          >
            Got it
          </Button>
        </div>
      )}

      {/* Show the icon button when state is 'icon' and not closed */}
      {status === "icon" && (
        <div className="fixed bottom-35 right-4 w-14 h-14 bg-red-400 rounded-full flex items-center justify-center cursor-pointer z-50">
          <CloudAlert className="text-white size-7" onClick={handleShowDialog} />

          {/* Close button 'X' in the upper right corner of the icon */}
          <div
            onClick={handleDismiss}
            className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-1 border-gray-200 shadow-lg"
          >
            <X className="text-red-400 size-5" />
          </div>
        </div>
      )}
    </>
  );
};

export default WarningMessage;
