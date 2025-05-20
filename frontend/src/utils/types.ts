export interface PlaceResult {
    id: string;
    name: string;
    location?: google.maps.LatLng;
    vicinity: string;
  }