import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import "./YourEarnings.css";

interface Earning {
  id: string;
  job_acceptance_id: string;
  amount: number;
  payment_date: string;
  status: string;
  transaction_id: string;
  booking_address: string;
  booking_city: string;
  completed_at: string;
}

function YourEarnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch shoveler payments with booking details
        const { data: payments, error: paymentsError } = await supabase
          .from("shoveler_payments")
          .select(
            `
            id,
            job_acceptance_id,
            amount,
            payment_date,
            status,
            transaction_id,
            job_acceptances (
              completed_at,
              bookings (
                address,
                city
              )
            )
          `
          )
          .eq("shoveler_id", user.id)
          .order("created_at", { ascending: false });

        if (paymentsError) throw paymentsError;

        // Transform data
        const transformedEarnings = (payments || []).map((payment: any) => ({
          id: payment.id,
          job_acceptance_id: payment.job_acceptance_id,
          amount: payment.amount,
          payment_date: payment.payment_date,
          status: payment.status,
          transaction_id: payment.transaction_id,
          booking_address: payment.job_acceptances?.bookings?.address || "N/A",
          booking_city: payment.job_acceptances?.bookings?.city || "N/A",
          completed_at: payment.job_acceptances?.completed_at,
        }));

        setEarnings(transformedEarnings);

        // Calculate total earnings (only completed/paid payments)
        const total = transformedEarnings
          .filter((e) => e.status === "completed" || e.status === "paid")
          .reduce((sum, e) => sum + e.amount, 0);

        setTotalEarnings(total);
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch earnings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      default:
        return "info";
    }
  };

  if (loading) {
    return (
      <div className="earnings-container">
        <h1>Your Earnings</h1>
        <p>Loading earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="earnings-container">
        <h1>Your Earnings</h1>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="earnings-container">
      <h1>Your Earnings</h1>

      <div className="earnings-summary">
        <div className="summary-card">
          <h3>Total Earnings</h3>
          <p className="total-amount">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Jobs Completed</h3>
          <p className="job-count">
            {earnings.filter((e) => e.completed_at).length}
          </p>
        </div>
        <div className="summary-card">
          <h3>Pending Payments</h3>
          <p className="pending-count">
            {earnings.filter((e) => e.status === "pending").length}
          </p>
        </div>
      </div>

      {earnings.length === 0 ? (
        <p className="no-earnings">No earnings yet. Start accepting jobs!</p>
      ) : (
        <div className="earnings-list">
          <h2>Payment History</h2>
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Amount</th>
                <th>Completed Date</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning) => (
                <tr key={earning.id}>
                  <td>
                    {earning.booking_address}, {earning.booking_city}
                  </td>
                  <td className="amount">${earning.amount.toFixed(2)}</td>
                  <td>
                    {earning.completed_at
                      ? new Date(earning.completed_at).toLocaleDateString()
                      : "Pending"}
                  </td>
                  <td>
                    {earning.payment_date
                      ? new Date(earning.payment_date).toLocaleDateString()
                      : "Not yet"}
                  </td>
                  <td>
                    <span
                      className={`status ${getStatusColor(earning.status)}`}
                    >
                      {earning.status}
                    </span>
                  </td>
                  <td className="transaction-id">
                    {earning.transaction_id || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default YourEarnings;
