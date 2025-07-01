import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"

import RootLayout from "./pages/RootLayout";
import TripsPage from './pages/TripsPage'
import TripPage from "./pages/TripPage";
import ProfilePage from "./pages/Profile";
import PlacesListPage from "./pages/PlacesListPage";
import EventFormPage from "./pages/EventFormPage";
import FullMapPage from "./pages/FullMapPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import { APIProvider } from '@vis.gl/react-google-maps';
import { Toaster } from "sonner";

import { useAuthStore } from "./state/useAuthStore";
import { useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { RequireAuth } from "./components/RequireAuth";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="trips" replace /> },
      { path: 'trips/:tripId', element: <TripPage /> }, // Public (view only)
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      // PROTECTED ROUTES
      {
        element: <RequireAuth />,
        children: [
          { path: 'trips', element: <TripsPage /> },
          { path: 'trips/:tripId/map', element: <FullMapPage /> },
          { path: 'trips/:tripId/:dayNumber/add', element: <PlacesListPage /> },
          { path: 'trips/:tripId/:dayNumber/add/:placeId', element: <EventFormPage /> },
          { path: 'trips/:tripId/edit/:eventId', element: <EventFormPage /> },
          { path: '/account', element: <ProfilePage /> },
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
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });
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
