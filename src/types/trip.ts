export interface Trip {
    id: string;
    name: string | null;
    destination: string | null;
    startDate: Date | null;
    endDate: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
  }