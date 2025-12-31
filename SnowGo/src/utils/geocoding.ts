/**
 * Geocoding utility using Google Maps Geocoding API
 * Validates and converts addresses to coordinates
 */

export interface GeocodeResult {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

/**
 * Geocodes an address using Google Maps Geocoding API
 * @param address Street address
 * @param city City name
 * @param zipCode ZIP code
 * @returns GeocodeResult with coordinates and formatted address, or null if not found
 */
export async function geocodeAddress(
    address: string,
    city: string,
    zipCode: string
): Promise<GeocodeResult | null> {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('Google Maps API key is not configured');
        throw new Error('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
    }

    // Construct full address
    const fullAddress = `${address}, ${city}, ${zipCode}`;

    try {
        // Use fetch API for browser compatibility
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            fullAddress
        )}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const location = result.geometry.location;

            return {
                latitude: location.lat,
                longitude: location.lng,
                formattedAddress: result.formatted_address,
            };
        } else if (data.status === 'ZERO_RESULTS') {
            // No results found - invalid address
            return null;
        } else if (data.status === 'REQUEST_DENIED') {
            console.error('Geocoding error:', data.error_message);
            throw new Error(`API key error: ${data.error_message || 'Please check your Google Maps API key and enable the Geocoding API.'}`);
        } else {
            console.error('Geocoding error:', data.status);
            throw new Error(`Geocoding failed: ${data.status}`);
        }
    } catch (error) {
        console.error('Error geocoding address:', error);
        if (error instanceof Error && error.message.includes('API key')) {
            throw error;
        }
        throw new Error('Unable to validate address. Please check your internet connection and try again.');
    }
}

/**
 * Validates if an address can be geocoded
 * @param address Street address
 * @param city City name
 * @param zipCode ZIP code
 * @returns true if address is valid, false otherwise
 */
export async function validateAddress(
    address: string,
    city: string,
    zipCode: string
): Promise<boolean> {
    try {
        const result = await geocodeAddress(address, city, zipCode);
        return result !== null;
    } catch {
        return false;
    }
}
