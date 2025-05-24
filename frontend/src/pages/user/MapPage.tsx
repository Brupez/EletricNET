import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadGoogleMapsApi } from "../../utils/loadGoogleMapsApi";
import { PlaceResult } from "../../utils/types";

interface Place extends PlaceResult {
    geometry: {
        location: google.maps.LatLng;
    };
    place_id: string;
    types?: string[];
    name: string;
    vicinity?: string;
}

interface InternalCharger {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    location: string;
    station?: {
        name: string;
    };
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
    const [internalChargers, setInternalChargers] = useState<InternalCharger[]>([]);

    const isNearby = (lat1: number, lng1: number, lat2: number, lng2: number, maxKm = 10): boolean => {
        const toRad = (value: number) => value * Math.PI / 180;
        const R = 6371; // km

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        return d <= maxKm;
    };


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

    const createPlaceMarker = (
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
                },
            });
        });
    };

    const createInternalMarker = (
        charger: InternalCharger,
        map: google.maps.Map,
        google: any
    ) => {
        const marker = new google.maps.Marker({
            position: { lat: charger.latitude, lng: charger.longitude },
            map,
            title: charger.name,
            icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: "#0f766e",
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 10,
            },
        });

        marker.addListener("click", () => {
            navigate(`/charger/${charger.id}`, {
                state: {
                    name: charger.name,
                    location: charger.location,
                    latitude: charger.latitude,
                    longitude: charger.longitude,
                },
            });
        });
    };

    const handleNearbySearch = (
        results: Place[],
        status: string,
        map: google.maps.Map,
        customMarker: google.maps.Symbol
    ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            setPlaces(results);
            results.forEach(place => createPlaceMarker(place, map, customMarker));
        }
    };

    const handleGeocodeResult = (
        results: any,
        status: any,
        mapInstance: MapInstance,
        google: any,
        data: InternalCharger[]
    ) => {
        if (status !== "OK" || !results[0]) return;

        const { map, service, customMarker } = mapInstance;
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14);

        service.nearbySearch(
            {
                location,
                radius: 5000,
                type: "charging_station",
            },
            (results, status) => handleNearbySearch(results, status, map, customMarker)
        );

        const centerLat = location.lat();
        const centerLng = location.lng();
        const filteredChargers = data.filter(ch =>
            isNearby(centerLat, centerLng, ch.latitude, ch.longitude)
        );

        filteredChargers.forEach(charger =>
            createInternalMarker(charger, map, google)
        );

        setInternalChargers(filteredChargers);
    };

    useEffect(() => {
        if (!location || !mapRef.current) return;

        const loadMapAndData = async () => {
            try {
                const mapInstance = await initializeMap(mapRef.current!);
                const { google } = window as typeof window & { google: any };
                const geocoder = new google.maps.Geocoder();

                const response = await fetch("http://localhost:8081/api/slots");
                const data = await response.json();
                setInternalChargers([]);

                geocoder.geocode({ address: location }, (results, status) => {
                    if (status !== "OK" || !results[0]) return;

                    handleGeocodeResult(results, status, mapInstance, google, data);
                });
            } catch (error) {
                console.error("Erro ao carregar o mapa:", error);
            }
        };

        loadMapAndData();
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
                        </li>
                    ))}
                    {internalChargers.map((charger) => {
                        //console.log("Charger recebido:", charger);

                        return (
                            <li key={charger.id} className="mb-2 p-2 bg-emerald-50 rounded">
                                <span className="font-medium">{charger.name}</span>
                                {charger.station?.name && (
                                    <p className="text-sm text-gray-600">{charger.station.name}</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default MapPage;