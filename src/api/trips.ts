export interface Trip {
    id: string;
    name: string;
    destination: string;
    date: string;
    description: string;
    image: string;
  }

// Fetch all trips
export const fetchTrips = async (): Promise<Trip[]> => {
    const response = await fetch("http://192.168.10.54:5000/trips");
    if (!response.ok) throw new Error("Failed to fetch trips");
    return response.json();
  };