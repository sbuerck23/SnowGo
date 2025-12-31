import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
} from "@react-google-maps/api";
import "./AvailableJobs.css";

interface Job {
  id: string;
  address: string;
  city: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  geocoded_address: string;
  preferred_date: string;
  preferred_time: string;
  driveway_size: string;
  additional_notes: string;
  status: string;
  created_at: string;
  distance_miles?: number;
}

function AvailableJobs() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [acceptedJobs, setAcceptedJobs] = useState<Set<string>>(new Set());
  const [shovelerLocation, setShovelerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [serviceRadius, setServiceRadius] = useState<number>(10);
  const [showMap, setShowMap] = useState(false);

  // Use useLoadScript instead of LoadScript to prevent re-loading
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        setUser(user);
        setUserId(user.id);

        // Fetch shoveler profile to get home location and service radius
        const { data: profile, error: profileError } = await supabase
          .from("shoveler_profiles")
          .select("home_latitude, home_longitude, service_radius_miles")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
        }

        if (!profile?.home_latitude || !profile?.home_longitude) {
          setError(
            "Please set your home location in Your Profile to see available jobs."
          );
          setLoading(false);
          return;
        }

        setShovelerLocation({
          lat: profile.home_latitude,
          lng: profile.home_longitude,
        });
        setServiceRadius(profile.service_radius_miles || 10);

        // Use PostGIS RPC function to get jobs within radius
        const { data: bookings, error: bookingsError } = await supabase.rpc(
          "get_jobs_within_radius",
          {
            shoveler_lat: profile.home_latitude,
            shoveler_lon: profile.home_longitude,
            radius_miles: profile.service_radius_miles || 10,
          }
        );

        if (bookingsError) {
          console.error("Bookings error:", bookingsError);
          throw bookingsError;
        }

        setJobs(bookings || []);

        // Fetch jobs already accepted by this shoveler
        const { data: acceptances, error: acceptancesError } = await supabase
          .from("job_acceptances")
          .select("booking_id")
          .eq("shoveler_id", user.id)
          .in("status", ["accepted", "completed"]);

        if (acceptancesError) throw acceptancesError;

        const acceptedIds = new Set(
          (acceptances || []).map((a) => a.booking_id)
        );
        setAcceptedJobs(acceptedIds);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndJobs();
  }, []);

  const handleAcceptJob = async (bookingId: string) => {
    if (!userId) return;

    try {
      // 1. Create job acceptance record
      const { error: acceptanceError } = await supabase
        .from("job_acceptances")
        .insert({
          booking_id: bookingId,
          shoveler_id: userId,
          status: "accepted",
          shoveler_name: user.user_metadata?.full_name,
        });

      if (acceptanceError) throw acceptanceError;

      // 2. Update booking status from pending to accepted
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "accepted" })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      // Remove from available jobs list
      setJobs((prev) => prev.filter((job) => job.id !== bookingId));
      setAcceptedJobs((prev) => new Set(prev).add(bookingId));
    } catch (err) {
      console.error("Error accepting job:", err);
      alert(err instanceof Error ? err.message : "Failed to accept job");
    }
  };

  if (loading) {
    return (
      <div className="available-jobs-container">
        <h1>Available Jobs</h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="available-jobs-container">
        <h1>Available Jobs</h1>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="available-jobs-container">
        <h1>Available Jobs</h1>
        <p className="error">Error loading maps</p>
      </div>
    );
  }

  return (
    <div className="available-jobs-container">
      <div className="jobs-header">
        <h1>Available Jobs</h1>
        {shovelerLocation && isLoaded && (
          <button
            className="toggle-map-btn"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        )}
      </div>

      {showMap && shovelerLocation && isLoaded && (
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={shovelerLocation}
            zoom={11}
          >
            {/* Shoveler's home location marker */}
            <Marker
              position={shovelerLocation}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
              title="Your Location"
            />

            {/* Service radius circle */}
            <Circle
              center={shovelerLocation}
              radius={serviceRadius * 1609.34} // Convert miles to meters
              options={{
                fillColor: "#4285F4",
                fillOpacity: 0.1,
                strokeColor: "#4285F4",
                strokeOpacity: 0.4,
                strokeWeight: 2,
              }}
            />

            {/* Job markers */}
            {jobs.map((job) => (
              <Marker
                key={job.id}
                position={{ lat: job.latitude, lng: job.longitude }}
                title={`${job.address} - ${job.distance_miles?.toFixed(1)} mi`}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
              />
            ))}
          </GoogleMap>
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="no-jobs">
          No jobs available within your service radius. Try increasing your
          service radius in Your Profile.
        </p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h2 className="job-location">
                  {job.address}, {job.city}
                </h2>
                <span className={`job-status ${job.status}`}>{job.status}</span>
              </div>
              {job.distance_miles !== undefined && (
                <div className="job-distance">
                  📍 {job.distance_miles.toFixed(1)} miles away
                </div>
              )}
              <div className="job-details">
                <div className="detail-row">
                  <span className="label">Zip Code:</span>
                  <span className="value">{job.zip_code}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{job.preferred_date}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span className="value">{job.preferred_time}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Driveway Size:</span>
                  <span className="value">{job.driveway_size}</span>
                </div>
                {job.additional_notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{job.additional_notes}</span>
                  </div>
                )}
              </div>
              <button
                className={`accept-btn ${
                  acceptedJobs.has(job.id) ? "accepted" : ""
                }`}
                onClick={() => handleAcceptJob(job.id)}
                disabled={acceptedJobs.has(job.id)}
              >
                {acceptedJobs.has(job.id) ? "Accepted" : "Accept Job"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvailableJobs;
