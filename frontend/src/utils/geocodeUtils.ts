export const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) resolve(results);
          else reject("No address found");
        });
      });
  
      return result[0].formatted_address;
    } catch (error) {
      console.error("Erro no reverse geocoding:", error);
      return `${lat}, ${lng}`;
    }
  };
  