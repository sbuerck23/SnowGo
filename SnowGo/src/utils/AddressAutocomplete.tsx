import { useRef, useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocompleteWidget, setAutocompleteWidget] = useState<any>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteWidget) return;

    // Use the new PlaceAutocompleteElement
    const setupAutocomplete = async () => {
      try {
        // @ts-ignore - PlaceAutocompleteElement is not yet in @types/google.maps
        const { PlaceAutocompleteElement } = await google.maps.importLibrary(
          "places"
        );

        // @ts-ignore - Using new Google Places API
        const autocomplete = new PlaceAutocompleteElement({
          componentRestrictions: { country: "us" },
        });

        // Set placeholder on the inner input
        const innerInput = autocomplete.querySelector("input");
        if (innerInput) {
          innerInput.placeholder = placeholder;
        }

        // Insert the autocomplete element
        if (inputRef.current && inputRef.current.parentElement) {
          inputRef.current.style.display = "none";
          inputRef.current.parentElement.insertBefore(
            autocomplete,
            inputRef.current
          );

          autocomplete.addEventListener("gmp-placeselect", async (event: any) => {
            const place = event.place;

            if (!place || !place.location) {
              console.log("No details available for input");
              return;
            }

            // Fetch full place details
            await place.fetchFields({
              fields: ["addressComponents", "location", "formattedAddress"],
            });

            // Extract address components
            let streetNumber = "";
            let route = "";
            let city = "";
            let zipCode = "";

            if (place.addressComponents) {
              place.addressComponents.forEach((component: any) => {
                const types = component.types;

                if (types.includes("street_number")) {
                  streetNumber = component.longText;
                }
                if (types.includes("route")) {
                  route = component.longText;
                }
                if (types.includes("locality")) {
                  city = component.longText;
                }
                if (types.includes("postal_code")) {
                  zipCode = component.longText;
                }
              });
            }

            const fullAddress = `${streetNumber} ${route}`.trim();
            const latitude = place.location.lat();
            const longitude = place.location.lng();

            console.log("Place selected:", {
              fullAddress,
              city,
              zipCode,
              latitude,
              longitude,
            });

            // Update the hidden input value
            if (inputRef.current) {
              inputRef.current.value = fullAddress;
            }
            onChange(fullAddress);

            // Notify parent component with all extracted data
            onPlaceSelected({
              address: fullAddress,
              city,
              zipCode,
              latitude,
              longitude,
            });
          });

          setAutocompleteWidget(autocomplete);
        }
      } catch (error) {
        console.error("Error loading PlaceAutocompleteElement:", error);
      }
    };

    setupAutocomplete();
  }, [isLoaded, onChange, onPlaceSelected]);

  // Sync the autocomplete input with the value prop
  useEffect(() => {
    if (autocompleteWidget) {
      const input = autocompleteWidget.querySelector("input");
      if (input && input.value !== value) {
        input.value = value;
      }
    }
  }, [value, autocompleteWidget]);

  if (!isLoaded || loadError) {
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
    <>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </>
  );
}
