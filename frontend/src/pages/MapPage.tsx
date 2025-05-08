import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadGoogleMapsApi } from '../utils/loadGoogleMapsApi';

const MapPage = () => {
    const [searchParams] = useSearchParams();
    const location = searchParams.get('location');
    const mapRef = useRef<HTMLDivElement>(null);
    const [places, setPlaces] = useState<any[]>([]);

    useEffect(() => {
        if (!location) return;

        const loadMap = async () => {
            try {
                await loadGoogleMapsApi(); 
                const { google } = window as any;
                const geocoder = new google.maps.Geocoder();

                geocoder.geocode({ address: location }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const map = new google.maps.Map(mapRef.current, {
                            center: results[0].geometry.location,
                            zoom: 14,
                        });

                        const service = new google.maps.places.PlacesService(map);
                        service.nearbySearch(
                            {
                                location: results[0].geometry.location,
                                radius: 5000,
                                type: 'charging_station',
                            },
                            (results, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK) {
                                    setPlaces(results || []);
                                    results.forEach((place) => {
                                        new google.maps.marker.AdvancedMarkerElement({
                                            map,
                                            position: place.geometry.location,
                                            title: place.name,
                                        });
                                    });
                                }
                            }
                        );
                    }
                });
            } catch (error) {
                console.error('Failed to load Google Maps API:', error);
            }
        };

        loadMap();
    }, [location]);

    return (
        <div className="card">
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
                        <span className="font-medium">{place.displayName.text}</span>
                        <p className="text-sm text-gray-600">{place.formattedAddress}</p>
                      </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MapPage;