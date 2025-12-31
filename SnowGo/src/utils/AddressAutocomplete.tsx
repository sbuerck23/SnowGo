import { useRef, useEffect, useState } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: {
    address: string;
    city: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Enter address",
  required = false,
  name = "address",
  id = "address",
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [shouldShowAutocomplete, setShouldShowAutocomplete] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Wait a small delay before showing autocomplete to ensure modal is fully rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShowAutocomplete(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.log("No details available for input:", place.name);
        return;
      }

      // Extract address components
      let streetNumber = "";
      let route = "";
      let city = "";
      let zipCode = "";

      place.address_components?.forEach((component) => {
        const types = component.types;

        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (types.includes("route")) {
          route = component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("postal_code")) {
          zipCode = component.long_name;
        }
      });

      const fullAddress = `${streetNumber} ${route}`.trim();
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      // Update the input value
      onChange(fullAddress);

      // Notify parent component with all extracted data
      onPlaceSelected({
        address: fullAddress,
        city,
        zipCode,
        latitude,
        longitude,
      });
    }
  };

  if (!isLoaded || !shouldShowAutocomplete || loadError) {
    return (
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: "us" },
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
      }}
    >
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </Autocomplete>
  );
}
