import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsApi } from "../utils/loadGoogleMapsApi";
import { X } from "lucide-react";

interface LocationMapModalProps {
  onClose: () => void;
  onSelect: (lat: number, lng: number, placeName?: string) => void;
}

const LocationMapModal = ({ onClose, onSelect }: LocationMapModalProps) => {
  const [search, setSearch] = useState("Aveiro");
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      await loadGoogleMapsApi();
      const { google } = window as any;

      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 39.5, lng: -8.0 },
        zoom: 6,
      });

      const geocoder = new google.maps.Geocoder();

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();

        if (lat && lng) {
          if (marker) marker.setMap(null);

          const newMarker = new google.maps.Marker({
            position: { lat, lng },
            map,
          });

          setMarker(newMarker);

          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
              const placeName = results[0].formatted_address;
              onSelect(lat, lng, placeName);
            } else {
              onSelect(lat, lng, "Unknown location");
            }
          });
        }
      });

      setMapInstance(map);
    };

    initMap();
  }, []);

  const handleSearch = () => {
    if (!mapInstance || !search.trim()) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: search }, (results, status) => {
      if (status === "OK" && results[0]) {
        mapInstance.setCenter(results[0].geometry.location);
        mapInstance.setZoom(14);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-3">Select Location</h2>

        <div className="flex mb-3 gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <div
          ref={mapRef}
          className="h-[400px] w-full rounded border border-gray-200"
        ></div>
      </div>
    </div>
  );
};

export default LocationMapModal;
