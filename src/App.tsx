import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import RootLayout from "./pages/RootLayout";
import TripsPage from './pages/Trips'
import TripPage from "./pages/Trip";
import ProfilePage from "./pages/Profile";
import PlacesListPage from "./pages/PlacesListPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import EventFormPage from "./pages/EventFormPage";
import FullMapPage from "./pages/FullMapPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="trips" replace /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'trips/:tripId', element: <TripPage /> },
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
