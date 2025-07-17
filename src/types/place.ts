export interface Place {
    id: string;
    name: string;
    category: string;
    img: string;
    address: string;
    lat: number,
    lng: number,
    rating?: number | null | undefined;
    userRatingCount?: number | null | undefined;
    reviews?: google.maps.places.Review[] | undefined;
}
