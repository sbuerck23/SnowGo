import { useState, useEffect } from "react";
import { geocodeAddress } from "../utils/geocoding";
import AddressAutocomplete from "../utils/AddressAutocomplete";
import "./BookingDialog.css";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void> | void;
}

export default function BookingDialog({
  isOpen,
  onClose,
  onSubmit,
}: BookingDialogProps) {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    zipCode: "",
    date: "",
    time: "",
    drivewaySize: "small",
    additionalNotes: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceSelected = (place: {
    address: string;
    city: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      address: place.address,
      city: place.city,
      zipCode: place.zipCode,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use autocomplete coordinates if available, otherwise geocode
      let latitude = formData.latitude;
      let longitude = formData.longitude;
      let formattedAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}`;

      if (!latitude || !longitude) {
        setError("Validating address...");
        const geocodeResult = await geocodeAddress(
          formData.address,
          formData.city,
          formData.zipCode
        );

        if (!geocodeResult) {
          setError(
            "Unable to verify this address. Please check that the address, city, and ZIP code are correct."
          );
          setLoading(false);
          return;
        }

        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        formattedAddress = geocodeResult.formattedAddress;
      }

      setError(null);

      // Pass geocoded data to parent
      await onSubmit({
        ...formData,
        latitude,
        longitude,
        geocodedAddress: formattedAddress,
      });

      // Reset form after submit
      setFormData({
        address: "",
        city: "",
        zipCode: "",
        date: "",
        time: "",
        drivewaySize: "small",
        additionalNotes: "",
        latitude: null,
        longitude: null,
      });
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-header"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h1>Book a Shoveler</h1>
            <p className="modal-subtitle">
              Get your driveway cleared quickly and easily
            </p>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h2>Service Location</h2>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, address: value }))
                }
                onPlaceSelected={handlePlaceSelected}
                placeholder="Start typing your address..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Denver"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="80202"
                  required
                />
              </div>
            </div>
            
            <h2>Service Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Preferred Time *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="drivewaySize">Driveway Size *</label>
              <select
                id="drivewaySize"
                name="drivewaySize"
                value={formData.drivewaySize}
                onChange={handleChange}
                required
              >
                <option value="small">Small (single car)</option>
                <option value="medium">Medium (double car)</option>
                <option value="large">Large (3+ cars)</option>
                <option value="extra-large">
                  Extra Large (multi-car + walkway)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any special requests or details..."
                rows={4}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Request a Shoveler"}
          </button>
        </form>
      </div>
    </div>
  );
}
