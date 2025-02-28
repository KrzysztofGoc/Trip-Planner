import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import RootLayout from "./pages/RootLayout";
import TripsPage from './pages/Trips'
import TripPage from "./pages/Trip";
import ProfilePage from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="trips" replace /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'trips/:tripId', element: <TripPage /> },
      { path: 'profile', element: <ProfilePage />}

    ]
  }
]);

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
