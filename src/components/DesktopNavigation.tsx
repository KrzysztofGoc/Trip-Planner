import { Button } from "@/components/ui/button"
import { Plus, LogIn } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { createTrip } from "@/api/trips"
import { toast } from "sonner"
import { useAuthStore } from "@/state/useAuthStore"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function DesktopNavigation() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  // Trip creation mutation
  const { mutate: handleCreateTrip, isPending } = useMutation({
    mutationFn: createTrip,
    onMutate: () => {
      toast.loading("Creating trip...", { id: "create-trip" })
    },
    onSuccess: (tripId) => {
      toast.success("Trip created!", { id: "create-trip" })
      navigate(`/trips/${tripId}`)
    },
    onError: () => {
      toast.error("Failed to create trip", { id: "create-trip" })
    }
  })

  // Handler for "Create a trip"
  function onCreateTrip() {
    if (!user || user.isAnonymous) {
      toast.error("You must be logged in to add a trip.")
      navigate("/login")
      return
    }
    handleCreateTrip()
  }

  return (
    <nav className="w-full items-center justify-between py-3 px-6 md:px-10 lg:px-20 2xl:px-24 bg-white hidden sm:flex">
      {/* Logo (clickable) */}
      <Link to="/trips" className="flex items-center gap-3 group transition">
        <div className="w-14 h-14 rounded-full bg-red-200 flex items-center justify-center">
          <span className="text-2xl font-bold">✈️</span>
        </div>
        <span className="font-bold text-xl tracking-tight hidden lg:block">Trip Planner</span>
      </Link>

      {/* Right side: Create Trip + Profile/Login */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={onCreateTrip}
          disabled={isPending}
          className="h-10 bg-transparent shadow-none border-none transition text-black rounded-full font-bold text-sm"
        >
          <Plus className="size-6 mr-1" />
          Create a trip
        </Button>

        {/* Profile/Login Button */}
        {user && !user.isAnonymous ? (
          <Link to="/account">
            <Avatar className="size-12 border-2 border-gray-200 shadow hover:shadow-lg transition">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "Profile Picture"} />
              <AvatarFallback>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link to="/login">
            <Button
              variant="secondary"
              className="h-10 bg-transparent shadow-none border-none transition text-black rounded-full font-bold text-sm"
            >
              <LogIn className="size-6" />
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
