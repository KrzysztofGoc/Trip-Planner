import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"

import RootLayout from "./pages/RootLayout";
import TripsPage from './pages/TripsPage'
import TripPage from "./pages/TripPage";
import ProfilePage from "./pages/Profile";
import PlacesListPage from "./pages/PlacesListPage";
import EventFormPage from "./pages/EventFormPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import { APIProvider } from '@vis.gl/react-google-maps';
import { Toaster } from "sonner";

import { useAuthStore } from "./state/useAuthStore";
import { useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { RequireAuth } from "./components/RequireAuth";
import NavigationLayout from "./pages/NavigationLayout";
import ErrorBoundary from "./components/ErrorBoundary";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <RequireAuth />,
        errorElement: <ErrorBoundary />,
        children: [
          { index: true, element: <Navigate to="trips" replace /> },
          { path: 'trips/:tripId', element: <TripPage /> },
          { path: 'trips/:tripId/:dayNumber/add', element: <PlacesListPage /> },
          { path: 'trips/:tripId/:dayNumber/add/:placeId', element: <EventFormPage /> },
          { path: 'trips/:tripId/edit/:eventId', element: <EventFormPage /> },
          {
            element: <NavigationLayout />,
            children: [
              { path: 'trips', element: <TripsPage /> },
              { path: 'account', element: <ProfilePage /> },
              { path: 'login', element: <LoginPage /> },
              { path: 'register', element: <RegisterPage /> },
            ]
          },
        ],
      },
    ]
  },
]);

function App() {
  // Setup authentication
  const setUser = useAuthStore(s => s.setUser);
  const setLoading = useAuthStore(s => s.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If no user is logged in, sign in anonymously
        await signInAnonymously(auth);
      }
      // Set the user in your Zustand store (whether anonymous or authenticated)
      setUser(auth.currentUser);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" swipeDirections={["right"]} />
      </QueryClientProvider>
    </APIProvider>
  )
}

export default App
