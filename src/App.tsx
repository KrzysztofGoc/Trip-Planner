import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import RootLayout from "./pages/RootLayout";
import TripsPage from './pages/TripsPage'
import TripPage from "./pages/TripPage";
import ProfilePage from "./pages/Profile";
import PlacesListPage from "./pages/PlacesListPage";
import EventFormPage from "./pages/EventFormPage";
import FullMapPage from "./pages/FullMapPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import { APIProvider } from '@vis.gl/react-google-maps';
import { Toaster } from "sonner";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="trips" replace /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'trips/:tripId', element: <TripPage /> },
      { path: 'trips/new', element: <TripPage /> },
      { path: 'trips/:tripId/map', element: <FullMapPage /> },
      { path: 'trips/:tripId/:dayNumber/add', element: <PlacesListPage /> },
      { path: 'trips/:tripId/:dayNumber/add/:placeId', element: <EventFormPage /> },
      { path: 'trips/:tripId/edit/:eventId', element: <EventFormPage /> },
      { path: 'profile', element: <ProfilePage /> }
    ]
  }
]);

function App() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" swipeDirections={["right"]}/>
      </QueryClientProvider>
    </APIProvider>
  )
}

export default App
