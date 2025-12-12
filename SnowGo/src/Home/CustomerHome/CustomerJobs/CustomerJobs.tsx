import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import CompleteJobPaymentModal from "./CompleteJobPaymentModal/CompleteJobPaymentModal";
import "./CustomerJobs.css";

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

interface JobWithAcceptance extends Job {
  acceptanceId: string | null;
  acceptanceStatus: string | null;
  shovelerName: string | null;
  completedAt: string | null;
}

interface CustomerJobsProps {
  refreshCounter?: number;
}

function CustomerJobs({ refreshCounter }: CustomerJobsProps) {
  const [jobs, setJobs] = useState<JobWithAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobForPayment, setSelectedJobForPayment] =
    useState<JobWithAcceptance | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchCustomerJobs = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch all jobs posted by this customer with acceptance details
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(
            `
            id,
            address,
            city,
            zip_code,
            preferred_date,
            preferred_time,
            driveway_size,
            additional_notes,
            status,
            created_at,
            job_acceptances (
              id,
              shoveler_id,
              shoveler_name,
              status,
              completed_at
            )
          `
          )
          .eq("user_id", user.id)
          .order("preferred_date", { ascending: false });

        if (bookingsError) throw bookingsError;

        // Transform data
        const transformed = (bookings || []).map((booking: any) => {
          const acceptance = booking.job_acceptances?.[0];
          return {
            id: booking.id,
            address: booking.address,
            city: booking.city,
            zip_code: booking.zip_code,
            preferred_date: booking.preferred_date,
            preferred_time: booking.preferred_time,
            driveway_size: booking.driveway_size,
            additional_notes: booking.additional_notes,
            status: booking.status,
            created_at: booking.created_at,
            acceptanceId: acceptance?.id || null,
            acceptanceStatus: acceptance?.status || null,
            shovelerId: acceptance?.shoveler_id || null,
            shovelerName: acceptance?.shoveler_name,
            completedAt: acceptance?.completed_at || null,
          };
        });

        setJobs(transformed);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerJobs();
  }, [refreshCounter]);

  const handleDeleteJob = async (jobId: string, jobStatus: string) => {
    if (jobStatus !== "pending") {
      alert("Can only delete pending jobs that haven't been accepted.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err instanceof Error ? err.message : "Failed to delete job");
    }
  };

  const handleCompletePayment = async (
    jobId: string,
    shovelerId: string,
    amount: number
  ) => {
    setIsProcessingPayment(true);
    try {
      const job = jobs.find((j) => j.id === jobId);
      if (!job || !job.acceptanceId) return;

      // Update job_acceptances with payment_status
      const { error: acceptanceError } = await supabase
        .from("job_acceptances")
        .update({
          payment_status: "paid",
        })
        .eq("id", job.acceptanceId);

      if (acceptanceError) throw acceptanceError;

      // Update shoveler_payments with payment status and date
      const { error: paymentError } = await supabase
        .from("shoveler_payments")
        .update({
          status: "completed",
          payment_date: new Date().toISOString().split("T")[0],
          amount: amount,
        })
        .eq("job_acceptance_id", job.acceptanceId);

      if (paymentError) throw paymentError;

      // Update booking status to paid
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", jobId);

      if (bookingError) throw bookingError;

      const { error: shovelerProfileError } = await supabase.rpc(
        "increment_shoveler_jobs",
        {
          target_id: shovelerId,
        }
      );
      if (shovelerProfileError) throw shovelerProfileError;

      // Update local state
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, status: "paid", acceptanceStatus: "completed" }
            : j
        )
      );

      setSelectedJobForPayment(null);
      alert("Payment completed successfully!");
    } catch (err) {
      console.error("Error completing payment:", err);
      throw err;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getAcceptanceStatusColor = (status: string | null) => {
    switch (status) {
      case "accepted":
        return "accepted";
      case "completed":
        return "completed";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="customer-jobs-container">
        <h2>My Posted Jobs</h2>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-jobs-container">
        <h2>My Posted Jobs</h2>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="customer-jobs-container">
        <h2>My Posted Jobs</h2>

        {jobs.length === 0 ? (
          <p className="no-jobs">
            You haven't posted any jobs yet. Create a booking to get started!
          </p>
        ) : (
          <div className="jobs-table-wrapper">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Date & Time</th>
                  <th>Driveway Size</th>
                  <th>Shoveler</th>
                  <th>Work Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className={`job-row ${job.status}`}>
                    <td>
                      <div className="location-info">
                        <strong>{job.address}</strong>
                        <p>
                          {job.city}, {job.zip_code}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="date-time">
                        {new Date(job.preferred_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                        <br />
                        {job.preferred_time.substring(0, 5)}
                      </div>
                    </td>
                    <td>{job.driveway_size}</td>
                    <td>
                      {job.shovelerName ? (
                        <div className="shoveler-info">
                          <strong>{job.shovelerName}</strong>
                          <p className="acceptance-id">
                            ID: {job.acceptanceId?.substring(0, 8)}...
                          </p>
                        </div>
                      ) : (
                        <span className="no-shoveler">
                          No shoveler assigned
                        </span>
                      )}
                    </td>
                    <td>
                      {job.acceptanceStatus && (
                        <span
                          className={`status-badge ${getAcceptanceStatusColor(
                            job.acceptanceStatus
                          )}`}
                        >
                          {job.acceptanceStatus.charAt(0).toUpperCase() +
                            job.acceptanceStatus.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {job.status === "pending" && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteJob(job.id, job.status)}
                            title="Delete pending job"
                          >
                            Delete
                          </button>
                        )}
                        {job.acceptanceStatus === "completed" &&
                          job.status !== "paid" && (
                            <button
                              className="btn-payment"
                              onClick={() => setSelectedJobForPayment(job)}
                              title="Complete payment"
                            >
                              Pay
                            </button>
                          )}
                        {job.additional_notes && (
                          <button
                            className="btn-notes"
                            onClick={() =>
                              alert(`Notes: ${job.additional_notes}`)
                            }
                            title="View notes"
                          >
                            Notes
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CompleteJobPaymentModal
        isOpen={!!selectedJobForPayment}
        job={selectedJobForPayment}
        onClose={() => setSelectedJobForPayment(null)}
        onSubmit={handleCompletePayment}
        isLoading={isProcessingPayment}
      />
    </>
  );
}

export default CustomerJobs;
