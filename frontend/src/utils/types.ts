export interface PlaceResult {
    place_id: string;
    name: string;
    location?: google.maps.LatLng;
    vicinity?: string;
    rating?: number;
    opening_hours?: google.maps.places.OpeningHours;
    price_level?: number;
}