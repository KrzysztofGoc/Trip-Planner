import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import RootLayout from "./pages/RootLayout";
import TripsPage from './pages/Trips'
import TripPage from "./pages/Trip";
import ProfilePage from "./pages/Profile";
import PlacesListPage from "./pages/PlacesListPage";
import AddEventPage from "./pages/AddEventPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import EditEventPage from "./pages/EditEventPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="trips" replace /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'trips/:tripId', element: <TripPage /> },
      { path: 'trips/:tripId/:dayId/add', element: <PlacesListPage /> },
      { path: 'trips/:tripId/:dayId/add/:placeId', element: <AddEventPage /> },
      { path: 'trips/:tripId/edit/:eventId', element: <EditEventPage /> },
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
