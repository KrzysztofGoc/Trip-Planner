import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AppError } from "./AppError";

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let description = "Sorry, we couldn't complete your request.";
  let showTryAgain = true;

  if (isRouteErrorResponse(error)) {
    // React-router-thrown errors with status
    if (error.status === 404) {
      title = "Page Not Found";
      description = "The page you're looking for doesn't exist.";
      showTryAgain = false;
    } else if (error.status >= 500) {
      title = "Server Error";
      description = "There was a problem with our server. Please try again.";
    }
  } else if (error instanceof AppError) {
    // Our custom app error
    title = error.title;
    description = error.description;
    showTryAgain = error.status !== 404; // Don’t show "Try Again" on not found
  } else if (error instanceof Error) {
    // Other generic errors
    description = error.message;
  }

  // Actions
  const handleBack = () => navigate('/trips');
  const handleReload = () => window.location.reload();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 py-8">
      <div className="flex flex-col items-center gap-4 bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-2" />
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-center">{description}</p>
        <div className="flex gap-4 mt-4">
          <Button onClick={handleBack} className="w-auto h-12 bg-red-400 text-white rounded-lg">
            Back to Trips
          </Button>
          {showTryAgain && (
            <Button onClick={handleReload} variant="outline" className="w-auto h-12 rounded-lg border-gray-300">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
