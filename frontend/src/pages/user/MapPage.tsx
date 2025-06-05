import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadGoogleMapsApi } from "../../utils/loadGoogleMapsApi";
import { PlaceResult } from "../../utils/types";
import Header from "../../components/Header";

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
    global_code?: string;
}

interface MapInstance {
    map: google.maps.Map;
    service: google.maps.places.PlacesService;
    customMarker: google.maps.Symbol;
}

// const BASEURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const MapPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = searchParams.get("location");
    const mapRef = useRef<HTMLDivElement>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
    const [searchLocation, setSearchLocation] = useState("");
    const [mapInstance, setMapInstance] = useState<MapInstance | null>(null);

    const handleFilterChange = (showOpenOnly: boolean) => {
        if (showOpenOnly) {
            setFilteredPlaces(places.filter((place) => place.businessStatus === "OPERATIONAL"));
        } else {
            setFilteredPlaces(places);
        }
    };

    const createCustomMarker = (google: any) => ({
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: "#243E16",
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 10,
    });

    const handleChargerClick = (
        id: string,
        isExternal = true,
        place?: Place
    ) => {
        const cleanedId = id.startsWith("internal-") ? id.replace("internal-", "") : id;

        navigate(`/charger/${cleanedId}`, {
            state: {
                isExternal,
                name: place?.name,
                location: place?.vicinity || "",
                latitude: place?.geometry.location.lat(),
                longitude: place?.geometry.location.lng(),
                isOpen: place?.isOpen ?? false,
                rating: place?.rating,
                businessStatus: place?.businessStatus,
                openingHoursText: place?.openingHoursText,
            },
        });
    };

    const handleSearch = () => {
        if (!searchLocation) return;
        navigate(`/map?location=${encodeURIComponent(searchLocation)}`);
    };

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
            icon: customMarker,
        });

        marker.addListener("click", () => {
            handleChargerClick(place.place_id, true, place);
        });
    };

    const createInternalMarker = (
        slot: any,
        map: google.maps.Map
    ) => {
        const { google } = window as typeof window & { google: any };

        const lightGreenMarker: google.maps.Symbol = {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            fillColor: "#4CAF50",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 10,
        };

        const position = new google.maps.LatLng(slot.latitude, slot.longitude);

        const marker = new google.maps.Marker({
            position,
            map,
            title: slot.name,
            icon: lightGreenMarker,
        });

        marker.addListener("click", () => {
            handleChargerClick(slot.id.toString(), false);
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
                    fields: ["opening_hours", "rating", "business_status"],
                },
                (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && result?.opening_hours) {
                        const updatedPlace: Place = {
                            ...place,
                            isOpen: result.opening_hours?.isOpen(),
                            openingHoursText: result.opening_hours?.weekday_text,
                            rating: result.rating,
                            businessStatus: result.business_status,
                        };
                        resolve(updatedPlace);
                    } else {
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
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const mappedResults: Place[] = results
                .map((result) => ({
                    place_id: result.place_id!,
                    name: result.name!,
                    geometry: { location: result.geometry!.location! },
                    vicinity: result.vicinity,
                    global_code: result.plus_code?.global_code,
                }))
                .filter((place) => place.place_id);

            const placesWithDetails = await Promise.all(
                mappedResults.map((place) => getPlaceDetails(place, service))
            );

            setPlaces(placesWithDetails);
            setFilteredPlaces(placesWithDetails);
            placesWithDetails.forEach((place) => createMarker(place, map, customMarker));
        } else {
            setPlaces([]);
            setFilteredPlaces([]);
        }
    };

    const handleGeocodeResult = (
        results: google.maps.GeocoderResult[],
        status: google.maps.GeocoderStatus,
        mapInstance: MapInstance
    ) => {
        if (status !== google.maps.GeocoderStatus.OK || !results[0]) {
            return;
        }

        const { map, service, customMarker } = mapInstance;
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);

        service.nearbySearch(
            {
                location: results[0].geometry.location,
                radius: 5000,
                type: "electric_vehicle_charging_station",
            },
            (results, status) => handleNearbySearch(results, status, map, customMarker, service)
        );
    };

    const loadInternalSlots = async () => {
        if (!mapInstance || !location) return;
        try {
            const response = await fetch(`/api/slots`);
            const slots = await response.json();

            const { google } = window as typeof window & { google: any };
            const geocoder = new google.maps.Geocoder();

            const internalPlaces: Place[] = [];

            for (const slot of slots) {
                if (!slot.latitude || !slot.longitude) continue;

                const position = new google.maps.LatLng(slot.latitude, slot.longitude);

                await new Promise<void>((resolve) => {
                    geocoder.geocode({ location: position }, (results, status) => {
                        if (
                            status === google.maps.GeocoderStatus.OK &&
                            results &&
                            results[0] &&
                            results[0].formatted_address.toLowerCase().includes(location.toLowerCase())
                        ) {
                            createInternalMarker(slot, mapInstance.map);

                            internalPlaces.push({
                                place_id: `internal-${slot.id}`,
                                name: slot.name,
                                geometry: { location: position },
                                vicinity: results[0].formatted_address,
                            } as Place);
                        }
                        resolve();
                    });
                });
            }

            setPlaces(prev => [...prev, ...internalPlaces]);
            setFilteredPlaces(prev => [...prev, ...internalPlaces]);

        } catch (error) {
            console.error("Error loading internal slots:", error);
        }
    };

    useEffect(() => {
        if (!location || !mapRef.current) return;

        const loadMap = async () => {
            try {
                const instance = await initializeMap(mapRef.current!);
                setMapInstance(instance);
                const geocoder = new google.maps.Geocoder();

                geocoder.geocode({ address: location }, (results, status) => {
                    handleGeocodeResult(results, status, instance);
                });
            } catch (error) {
                console.error("Error loading the map:", error);
            }
        };

        loadMap();
    }, [location]);

    useEffect(() => {
        loadInternalSlots();
    }, [mapInstance]);

    return (
        <div className="card p-4">
            <Header
                onFilterOpenChange={handleFilterChange}
                searchLocation={searchLocation}
                onSearchChange={setSearchLocation}
                onSearch={handleSearch}
            />
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Charging Stations Map</h2>
            </div>

            <div className="relative bg-gray-100 rounded-lg h-[600px] w-full">
                <div ref={mapRef} className="h-full w-full rounded-lg" />

                <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 shadow-md rounded-md p-3 text-sm space-y-2 z-10 border border-gray-300">
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: "#243E16" }}></span>
                        <span>External Chargers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: "#4CAF50" }}></span>
                        <span>EletricNET Chargers</span>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                    Nearby Stations ({filteredPlaces.length})
                </h3>
                <ul>
                    {filteredPlaces.map((place) => (
                        <li
                            key={place.place_id}
                            className={`mb-2 ${place.place_id.startsWith("internal-") ? "bg-green-50" : ""
                                }`}
                        >
                            <button
                                onClick={() => handleChargerClick(place.place_id, !place.place_id.startsWith("internal-"), place)}
                                className="w-full p-2 rounded hover:bg-gray-100 transition-colors text-left"
                            >
                                <span className="font-medium block">{place.name}</span>
                                {place.vicinity && (
                                    <p className="text-sm text-gray-600">{place.vicinity}</p>
                                )}
                                {place.rating !== undefined && (
                                    <p className="text-sm text-gray-700">Rating: {place.rating.toFixed(1)}</p>
                                )}
                                {place.businessStatus && (
                                    <p
                                        className={`text-sm ${place.businessStatus === "OPERATIONAL"
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {place.businessStatus === "OPERATIONAL" ? "Open Now" : "Closed"}
                                    </p>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MapPage;