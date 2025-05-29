import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadGoogleMapsApi } from "../../utils/loadGoogleMapsApi";
import { PlaceResult } from "../../utils/types";


interface Place extends PlaceResult {
    place_id: string;
    name: string;
    geometry: {
      location: google.maps.LatLng;
    };
    vicinity?: string;
    isOpen?: boolean;
    rating?: number;
    openingHoursText?: string[];
    businessStatus?: google.maps.places.BusinessStatus;
}

interface MapInstance {
    map: google.maps.Map;
    service: google.maps.places.PlacesService;
    customMarker: google.maps.Symbol;
}

const MapPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = searchParams.get("location");
    const mapRef = useRef<HTMLDivElement>(null);
    const [places, setPlaces] = useState<Place[]>([]);

    const createCustomMarker = (google: any) => ({
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: '#243E16',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 10
    });

    const initializeMap = async (element: HTMLDivElement): Promise<MapInstance> => {
        await loadGoogleMapsApi();
        const { google } = window as typeof window & { google: any };

        const map = new google.maps.Map(element, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
        });

        const service = new google.maps.places.PlacesService(map);
        const customMarker = createCustomMarker(google);

        return { map, service, customMarker };
    };

    const createMarker = (
        place: Place,
        map: google.maps.Map,
        customMarker: google.maps.Symbol
    ) => {
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
            icon: customMarker
        });

        marker.addListener("click", () => {
            navigate(`/charger/${place.place_id}`, {
                state: {
                    name: place.name,
                    location: place.vicinity,
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng(),
                    isOpen: place.isOpen,
                },
            });
        });
    };

    const getPlaceDetails = async (
        place: Place,
        service: google.maps.places.PlacesService
    ): Promise<Place> => {
        return new Promise((resolve) => {
            service.getDetails(
                {
                    placeId: place.place_id,
                    fields: ['opening_hours', 'rating', 'business_status'],
                },
                (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && result?.opening_hours) {
                        const updatedPlace : Place = {
                            ...place,
                            isOpen: result.opening_hours ? result.opening_hours.isOpen() : undefined,
                            openingHoursText: result.opening_hours ? result.opening_hours.weekday_text : undefined,
                            rating: result.rating !== undefined ? result.rating : undefined,
                            businessStatus: result.business_status,
                        };
                        resolve(updatedPlace);
                    } else {
                        console.warn(`Could not get full details for ${place.name} (ID: ${place.place_id}). Status: ${status}`);
                        resolve(place);
                    }
                }
            );
        });
    };

    const handleNearbySearch = async (
        results: google.maps.places.PlaceResult[],
        status: google.maps.places.PlacesServiceStatus,
        map: google.maps.Map,
        customMarker: google.maps.Symbol,
        service: google.maps.places.PlacesService
    ) => {
        console.log('Places API Status:', status);
        console.log('Places API Results:', JSON.stringify(results, null, 2));

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const mappedResults: Place[] = results.map(result => ({
                place_id: result.place_id!,
                name: result.name!,
                geometry: {
                    location: result.geometry!.location!,
                },
                vicinity: result.vicinity,
            })).filter(place => place.place_id);

            const placesWithDetails = await Promise.all(
                mappedResults.map(place => getPlaceDetails(place, service))
            );
            setPlaces(placesWithDetails);
            placesWithDetails.forEach(place => createMarker(place, map, customMarker));
        } else {
            console.error("Nearby search failed with status:", status);
            setPlaces([]);
        }
    };

    const handleGeocodeResult = (
        results: google.maps.GeocoderResult[],
        status: google.maps.GeocoderStatus,
        mapInstance: MapInstance
    ) => {
        if (status != google.maps.GeocoderStatus.OK || !results[0]) {
            console.error("Geocode was not successful for the following reason:", status);
            return;
        }

        const { map, service, customMarker } = mapInstance;
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);

        service.nearbySearch(
            {
                location: results[0].geometry.location,
                radius: 5000,
                type: "electric_vehicle_charging_station"
            },
            (results, status) => handleNearbySearch(results, status, map, customMarker, service)
        );
    };

    useEffect(() => {
        if (!location || !mapRef.current) return;

        const loadMap = async () => {
            try {
                const mapInstance = await initializeMap(mapRef.current!);
                const geocoder = new google.maps.Geocoder();

                geocoder.geocode(
                    { address: location },
                    (results, status) => handleGeocodeResult(results, status, mapInstance)
                );
            } catch (error) {
                console.error("Error loading the map:", error);
            }
        };

        loadMap();
    }, [location, navigate]);

    return (
        <div className="card p-4">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Charging Stations Map
                </h2>
            </div>

            <div
                ref={mapRef}
                className="bg-gray-100 rounded-lg h-[600px] w-full"
            ></div>

            <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Nearby Stations</h3>
                <ul>
                    {places.map((place) => (
                        <li key={place.place_id} className="mb-2 p-2 bg-gray-50 rounded">
                            <span className="font-medium">{place.name}</span>
                            <p className="text-sm text-gray-600">{place.vicinity}</p>
                            {/* Display Rating */}
                            {place.rating !== undefined && (
                                <p className="text-sm text-gray-700">Rating: {place.rating.toFixed(1)}</p>
                            )}
                            {/* Display Open/Closed Status */}
                            <p className={`text-sm ${place.businessStatus == "OPERATIONAL" ? 'text-green-600' : 'text-red-600'}`}>
                                {place.businessStatus !== undefined ? (place.businessStatus == "OPERATIONAL" ? "Open Now" : "Closed"): "Closed"}
                            </p>
                            {/* Display Opening Hours Text */}
                            {place.openingHoursText && place.openingHoursText.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    <p className="font-semibold">Opening Hours:</p>
                                    <ul className="list-disc list-inside">
                                        {place.openingHoursText.map((text, index) => (
                                            <li key={index}>{text}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MapPage;