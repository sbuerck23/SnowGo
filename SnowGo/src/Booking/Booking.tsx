import { useState, useEffect } from "react";
import "./Booking.css";

function Booking() {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    zipCode: "",
    date: "",
    time: "",
    drivewaySize: "small",
    additionalNotes: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking request:", formData);
    // TODO: Handle booking submission to backend
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Book a Shoveler</h1>
        <p>Get your driveway cleared quickly and easily</p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Service Location</h2>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
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
        </div>

        <div className="form-section">
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

        <button type="submit" className="btn btn-primary">
          Request a Shoveler
        </button>
      </form>
    </div>
  );
}

export default Booking;
