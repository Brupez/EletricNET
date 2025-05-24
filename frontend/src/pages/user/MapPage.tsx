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
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#34d399",
        fillOpacity: 1,
        strokeColor: "#059669",
        strokeWeight: 1,
        scale: 8,
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
    google: any
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

    internalChargers.forEach(charger => {
      createInternalMarker(charger, map, google);
    });
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
        setInternalChargers(data);
  
        geocoder.geocode({ address: location }, (results, status) => {
          if (status !== "OK" || !results[0]) return;
  
          const { map, service, customMarker } = mapInstance;
          const center = results[0].geometry.location;
  
          map.setCenter(center);
          map.setZoom(14);
  
          service.nearbySearch(
            {
              location: center,
              radius: 5000,
              type: "charging_station",
            },
            (results, status) => handleNearbySearch(results, status, map, customMarker)
          );
  
          data.forEach((charger: InternalCharger) => {
            createInternalMarker(charger, map, google);
          });
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
          {internalChargers.map((charger) => (
            <li key={charger.id} className="mb-2 p-2 bg-emerald-50 rounded">
              <span className="font-medium">{charger.name}</span>
              <p className="text-sm text-emerald-700">{charger.location}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapPage;