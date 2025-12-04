import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "./AvailableJobs.css";

interface Job {
  id: string;
  address: string;
  city: string;
  zip_code: string;
  preferred_date: string;
  preferred_time: string;
  driveway_size: string;
  additional_notes: string;
  status: string;
  created_at: string;
}

function AvailableJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [acceptedJobs, setAcceptedJobs] = useState<Set<string>>(new Set());

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

        setUserId(user.id);

        // Fetch available bookings (pending status and not from this shoveler)
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .eq("status", "pending")
          .order("preferred_date", { ascending: true });

        if (bookingsError) throw bookingsError;
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
      const { error } = await supabase.from("job_acceptances").insert({
        booking_id: bookingId,
        shoveler_id: userId,
        status: "accepted",
      });

      if (error) throw error;

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

  return (
    <div className="available-jobs-container">
      <h1>Available Jobs</h1>
      {jobs.length === 0 ? (
        <p className="no-jobs">No jobs available at the moment.</p>
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
