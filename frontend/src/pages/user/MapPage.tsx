import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadGoogleMapsApi } from "../../utils/loadGoogleMapsApi";
import { PlaceResult } from "../../utils/types";

interface Place extends PlaceResult {
    geometry: {
      location: google.maps.LatLng;
    };
    place_id: string;
}

const MapPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = searchParams.get("location");
    const mapRef = useRef<HTMLDivElement>(null);
    const [places, setPlaces] = useState<Place[]>([]);

    useEffect(() => {
      if (!location || !mapRef.current) return;

      const loadMap = async () => {
        try {
          await loadGoogleMapsApi();
          const { google } = window as typeof window & { google: any };

          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
          });

          const customMarker = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#243E16',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 10
          };

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { address: location },
            (results: any, status: any) => {
              if (status !== "OK" || !results[0]) return;

              map.setCenter(results[0].geometry.location);
              map.setZoom(14);

              const service = new google.maps.places.PlacesService(map);
              service.nearbySearch(
                {
                  location: results[0].geometry.location,
                  radius: 5000,
                  type: "charging_station",
                },
                (results: any, status: any) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                    setPlaces(results ?? []);
                    results.forEach((place: Place) => {
                      const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map,
                        title: place.name,
                        icon: customMarker
                      });

                      marker.addListener("click", () => {
                        navigate(`/charger/${place.place_id}`);
                      });
                    });
                  }
                }
              );
            }
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
};

export default MapPage;