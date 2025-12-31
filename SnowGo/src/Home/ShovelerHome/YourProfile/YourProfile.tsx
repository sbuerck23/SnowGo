import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { geocodeAddress } from "../../../utils/geocoding";
import AddressAutocomplete from "../../../utils/AddressAutocomplete";
import "./YourProfile.css";

interface ShovelerProfile {
  id: string;
  phone_number: string;
  service_radius_miles: number;
  hourly_rate: number;
  bio: string;
  years_experience: number;
  is_available: boolean;
  availability_start_time: string;
  availability_end_time: string;
  service_days: string;
  rating: number;
  total_jobs_completed: number;
  home_address: string;
  home_city: string;
  home_zip_code: string;
  home_latitude: number;
  home_longitude: number;
}

function YourProfile() {
  const [profile, setProfile] = useState<ShovelerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone_number: "",
    service_radius_miles: 10,
    hourly_rate: 0,
    bio: "",
    years_experience: 0,
    is_available: true,
    availability_start_time: "08:00",
    availability_end_time: "17:00",
    service_days: "Monday,Tuesday,Wednesday,Thursday,Friday",
    home_address: "",
    home_city: "",
    home_zip_code: "",
    home_latitude: null as number | null,
    home_longitude: null as number | null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch shoveler profile
        const { data: profileData, error: profileError } = await supabase
          .from("shoveler_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setFormData({
            phone_number: profileData.phone_number,
            service_radius_miles: profileData.service_radius_miles,
            hourly_rate: profileData.hourly_rate,
            bio: profileData.bio || "",
            years_experience: profileData.years_experience || 0,
            is_available: profileData.is_available,
            availability_start_time:
              profileData.availability_start_time || "08:00",
            availability_end_time: profileData.availability_end_time || "17:00",
            service_days:
              profileData.service_days ||
              "Monday,Tuesday,Wednesday,Thursday,Friday",
            home_address: profileData.home_address || "",
            home_city: profileData.home_city || "",
            home_zip_code: profileData.home_zip_code || "",
            home_latitude: profileData.home_latitude,
            home_longitude: profileData.home_longitude,
          });
        } else {
          // Profile doesn't exist yet, show form to create one
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
      home_address: place.address,
      home_city: place.city,
      home_zip_code: place.zipCode,
      home_latitude: place.latitude,
      home_longitude: place.longitude,
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSuccessMessage(null);
      setError(null);

      // Geocode home address if provided
      let homeLatitude = formData.home_latitude;
      let homeLongitude = formData.home_longitude;

      if (
        formData.home_address &&
        formData.home_city &&
        formData.home_zip_code
      ) {
        if (!homeLatitude || !homeLongitude) {
          setError("Validating home address...");
          const geocodeResult = await geocodeAddress(
            formData.home_address,
            formData.home_city,
            formData.home_zip_code
          );

          if (!geocodeResult) {
            setError(
              "Unable to verify your home address. Please check that the address, city, and ZIP code are correct."
            );
            return;
          }

          homeLatitude = geocodeResult.latitude;
          homeLongitude = geocodeResult.longitude;
        }
        setError(null);
      }

      const dataToSave = {
        ...formData,
        home_latitude: homeLatitude,
        home_longitude: homeLongitude,
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from("shoveler_profiles")
          .update(dataToSave)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase.from("shoveler_profiles").insert({
          user_id: userId,
          ...dataToSave,
        });

        if (error) throw error;
      }

      // Update profile state with all data including coordinates
      setProfile({
        ...dataToSave,
        id: profile?.id || "",
        user_id: userId,
        rating: profile?.rating || 0,
        total_jobs_completed: profile?.total_jobs_completed || 0,
      } as ShovelerProfile);
      setIsEditing(false);
      setSuccessMessage("Profile saved successfully!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <h1>Your Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="profile-container">
        <h1>Your Profile</h1>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        {!isEditing && profile && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {isEditing ? (
        <form className="profile-form">
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number *</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-section">
            <h3>Home Location</h3>
            <p className="form-help-text">
              Set your home location to see jobs within your service radius
            </p>

            <div className="form-group">
              <label htmlFor="home_address">Home Address</label>
              <AddressAutocomplete
                value={formData.home_address}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, home_address: value }))
                }
                onPlaceSelected={handlePlaceSelected}
                placeholder="Start typing your address..."
                name="home_address"
                id="home_address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="home_city">City</label>
                <input
                  type="text"
                  id="home_city"
                  name="home_city"
                  value={formData.home_city}
                  onChange={handleInputChange}
                  placeholder="Denver"
                />
              </div>

              <div className="form-group">
                <label htmlFor="home_zip_code">ZIP Code</label>
                <input
                  type="text"
                  id="home_zip_code"
                  name="home_zip_code"
                  value={formData.home_zip_code}
                  onChange={handleInputChange}
                  placeholder="80202"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hourly_rate">Hourly Rate ($) *</label>
            <input
              type="number"
              id="hourly_rate"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="service_radius_miles">Service Radius (miles)</label>
            <input
              type="number"
              id="service_radius_miles"
              name="service_radius_miles"
              value={formData.service_radius_miles}
              onChange={handleInputChange}
              min="1"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="years_experience">Years of Experience</label>
            <input
              type="number"
              id="years_experience"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell customers about your experience and services"
            />
          </div>

          <div className="form-group">
            <label htmlFor="availability_start_time">
              Availability Start Time
            </label>
            <input
              type="time"
              id="availability_start_time"
              name="availability_start_time"
              value={formData.availability_start_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="availability_end_time">Availability End Time</label>
            <input
              type="time"
              id="availability_end_time"
              name="availability_end_time"
              value={formData.availability_end_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="service_days">Service Days (comma-separated)</label>
            <input
              type="text"
              id="service_days"
              name="service_days"
              value={formData.service_days}
              onChange={handleInputChange}
              placeholder="e.g., Monday,Tuesday,Wednesday,Thursday,Friday"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
            />
            <label htmlFor="is_available">Currently Available</label>
          </div>

          <div className="form-actions">
            <button type="button" className="save-btn" onClick={handleSave}>
              Save Profile
            </button>
            {profile && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : profile ? (
        <div className="profile-display">
          <div className="profile-stats">
            <div className="stat-card">
              <h3>Rating</h3>
              <p className="stat-value">
                {profile.rating ? profile.rating.toFixed(1) : "N/A"} ⭐
              </p>
            </div>
            <div className="stat-card">
              <h3>Jobs Completed</h3>
              <p className="stat-value">{profile.total_jobs_completed}</p>
            </div>
            <div className="stat-card">
              <h3>Hourly Rate</h3>
              <p className="stat-value">${profile.hourly_rate.toFixed(2)}/hr</p>
            </div>
            <div className="stat-card">
              <h3>Status</h3>
              <p
                className={`stat-value ${
                  profile.is_available ? "available" : "unavailable"
                }`}
              >
                {profile.is_available ? "Available" : "Unavailable"}
              </p>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-section">
              <h3>Contact Information</h3>
              <p>
                <strong>Phone:</strong> {profile.phone_number}
              </p>
            </div>

            <div className="info-section">
              <h3>Service Details</h3>
              {profile.home_address && (
                <p>
                  <strong>Home Location:</strong> {profile.home_address},{" "}
                  {profile.home_city}, {profile.home_zip_code}
                </p>
              )}
              <p>
                <strong>Service Radius:</strong> {profile.service_radius_miles}{" "}
                miles
              </p>
              <p>
                <strong>Years of Experience:</strong>{" "}
                {profile.years_experience || "Not specified"}
              </p>
            </div>

            <div className="info-section">
              <h3>Availability</h3>
              <p>
                <strong>Hours:</strong> {profile.availability_start_time} -{" "}
                {profile.availability_end_time}
              </p>
              <p>
                <strong>Days:</strong> {profile.service_days}
              </p>
            </div>

            {profile.bio && (
              <div className="info-section">
                <h3>Bio</h3>
                <p>{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default YourProfile;
