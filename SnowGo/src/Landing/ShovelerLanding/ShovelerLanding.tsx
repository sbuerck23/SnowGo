import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import AvailableJobs from "./AvailableJobs/AvailableJobs";
import YourEarnings from "./YourEarnings/YourEarnings";
import YourProfile from "./YourProfile/YourProfile";
import CompleteJobModal from "./CompleteJobModal/CompleteJobModal";

interface ShovelerLandingProps {
  username: string;
  onLogout: () => Promise<void>;
}

type CurrentPage = "dashboard" | "jobs" | "earnings" | "profile";

interface AcceptedJob {
  id: string;
  booking_id: string;
  address: string;
  city: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  hourly_rate: number;
}

function ShovelerLanding({ username, onLogout }: ShovelerLandingProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<CurrentPage>("dashboard");
  const [acceptedJobs, setAcceptedJobs] = useState<AcceptedJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedJobForCompletion, setSelectedJobForCompletion] =
    useState<AcceptedJob | null>(null);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  useEffect(() => {
    const fetchAcceptedJobs = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadingJobs(false);
          return;
        }

        setUserId(user.id);

        // Fetch accepted jobs with booking details
        const { data: jobAcceptances, error } = await supabase
          .from("job_acceptances")
          .select(
            `
            id,
            booking_id,
            status,
            bookings (
              id,
              address,
              city,
              preferred_date,
              preferred_time
            )
          `
          )
          .eq("shoveler_id", user.id)
          .eq("status", "accepted")
          .order("bookings(preferred_date)", { ascending: true })
          .limit(5);

        if (error) throw error;

        // Fetch shoveler profile separately
        const { data: profileData } = await supabase
          .from("shoveler_profiles")
          .select("hourly_rate")
          .eq("user_id", user.id)
          .single();

        const hourlyRate = profileData?.hourly_rate || 0;

        // Transform data
        const transformed = (jobAcceptances || []).map((job: any) => ({
          id: job.id,
          booking_id: job.booking_id,
          address: job.bookings?.address || "N/A",
          city: job.bookings?.city || "N/A",
          preferred_date: job.bookings?.preferred_date || "N/A",
          preferred_time: job.bookings?.preferred_time || "N/A",
          status: job.status,
          hourly_rate: hourlyRate,
        }));

        setAcceptedJobs(transformed);
      } catch (err) {
        console.error("Error fetching accepted jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (currentPage === "dashboard") {
      fetchAcceptedJobs();
    }
  }, [currentPage]);

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const isJobCompletable = (jobDate: string) => {
    const jobDateObj = new Date(jobDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    jobDateObj.setHours(0, 0, 0, 0);
    return jobDateObj <= today;
  };

  const handleCompleteJobSubmit = async (hours: number, notes: string) => {
    if (!selectedJobForCompletion || !userId) return;

    setIsSubmittingCompletion(true);
    try {
      const paymentAmount = hours * selectedJobForCompletion.hourly_rate;
      const completedAt = new Date().toISOString();

      // 1. Update job_acceptances status to completed
      const { error: acceptanceError } = await supabase
        .from("job_acceptances")
        .update({
          status: "completed",
          completed_at: completedAt,
          notes: notes || null,
        })
        .eq("id", selectedJobForCompletion.id);

      if (acceptanceError) throw acceptanceError;

      // 2. Create payment record
      const { error: paymentError } = await supabase
        .from("shoveler_payments")
        .insert({
          job_acceptance_id: selectedJobForCompletion.id,
          shoveler_id: userId,
          amount: paymentAmount,
          status: "pending",
          payment_date: null,
        });

      if (paymentError) throw paymentError;

      // 3. Update booking status to completed
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", selectedJobForCompletion.booking_id);

      if (bookingError) throw bookingError;

      // Remove completed job from the list
      setAcceptedJobs((prev) =>
        prev.filter((job) => job.id !== selectedJobForCompletion.id)
      );

      setSelectedJobForCompletion(null);
      alert("Job completed successfully! Payment pending.");
    } catch (err) {
      console.error("Error completing job:", err);
      throw err;
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  return (
    <div className="landing-container">
      <nav className="landing-navbar">
        <div className="navbar-brand">SnowGo</div>
        <div className="navbar-content">
          <span className="greeting">Hi {username}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {currentPage === "dashboard" && (
        <div className="shoveler-landing">
          <div className="shoveler-hero">
            <h1>Welcome to Your Shoveler Dashboard</h1>
            <p>Manage your jobs and earnings</p>
          </div>

          {acceptedJobs.length > 0 && (
            <div className="accepted-jobs-section">
              <h2>Your Accepted Jobs</h2>
              <div className="accepted-jobs-grid">
                {acceptedJobs.map((job) => (
                  <div key={job.id} className="job-tile">
                    <div className="job-tile-header">
                      <h3>{job.address}</h3>
                      <span className="job-status-badge">{job.status}</span>
                    </div>
                    <div className="job-tile-body">
                      <p className="job-city">{job.city}</p>
                      <div className="job-details-row">
                        <span className="detail-label">📅 Date:</span>
                        <span className="detail-value">
                          {formatDate(job.preferred_date)}
                        </span>
                      </div>
                      <div className="job-details-row">
                        <span className="detail-label">🕐 Time:</span>
                        <span className="detail-value">
                          {formatTime(job.preferred_time)}
                        </span>
                      </div>
                      <div className="job-details-row">
                        <span className="detail-label">💰 Rate:</span>
                        <span className="detail-value">
                          ${job.hourly_rate}/hr
                        </span>
                      </div>
                    </div>
                    {isJobCompletable(job.preferred_date) && (
                      <button
                        className="complete-job-btn"
                        onClick={() => setSelectedJobForCompletion(job)}
                      >
                        Complete Job
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="shoveler-content">
            <div
              className="shoveler-section"
              onClick={() => setCurrentPage("jobs")}
            >
              <h2>Available Jobs</h2>
              <p>Find and accept shoveling jobs in your area.</p>
            </div>
            <div
              className="shoveler-section"
              onClick={() => setCurrentPage("earnings")}
            >
              <h2>Your Earnings</h2>
              <p>Track your income and payment history.</p>
            </div>
            <div
              className="shoveler-section"
              onClick={() => setCurrentPage("profile")}
            >
              <h2>Your Profile</h2>
              <p>Manage your availability and service areas.</p>
            </div>
          </div>
        </div>
      )}

      {currentPage === "jobs" && (
        <div className="shoveler-page">
          <button
            className="back-btn"
            onClick={() => setCurrentPage("dashboard")}
          >
            ← Back to Dashboard
          </button>
          <AvailableJobs />
        </div>
      )}

      {currentPage === "earnings" && (
        <div className="shoveler-page">
          <button
            className="back-btn"
            onClick={() => setCurrentPage("dashboard")}
          >
            ← Back to Dashboard
          </button>
          <YourEarnings />
        </div>
      )}

      {currentPage === "profile" && (
        <div className="shoveler-page">
          <button
            className="back-btn"
            onClick={() => setCurrentPage("dashboard")}
          >
            ← Back to Dashboard
          </button>
          <YourProfile />
        </div>
      )}

      <CompleteJobModal
        isOpen={!!selectedJobForCompletion}
        job={selectedJobForCompletion}
        onClose={() => setSelectedJobForCompletion(null)}
        onSubmit={handleCompleteJobSubmit}
        isLoading={isSubmittingCompletion}
      />
    </div>
  );
}

export default ShovelerLanding;
