import { useState, useEffect } from "react";
import { supabase } from "../../../../supabaseClient";
import "./CompleteJobPaymentModal.css";

interface Job {
  id: string;
  address: string;
  city: string;
  preferred_date: string;
  shovelerName: string | null;
  acceptanceId: string | null;
  completedAt: string | null;
}

interface CompleteJobPaymentModalProps {
  isOpen: boolean;
  job: Job | null;
  onClose: () => void;
  onSubmit: (
    jobId: string,
    shovelerId: string,
    amount: number
  ) => Promise<void>;
  isLoading: boolean;
}

function CompleteJobPaymentModal({
  isOpen,
  job,
  onClose,
  onSubmit,
  isLoading,
}: CompleteJobPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [tip, setTip] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [shovelerPaymentInfo, setShovelerPaymentInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen && job?.acceptanceId) {
      fetchPaymentDetails();
    }
  }, [isOpen, job]);

  const fetchPaymentDetails = async () => {
    try {
      if (!job?.acceptanceId) return;

      // Fetch payment details from shoveler_payments
      const { data: payments, error: paymentError } = await supabase
        .from("shoveler_payments")
        .select("*")
        .eq("job_acceptance_id", job.acceptanceId)
        .single();

      if (paymentError && paymentError.code !== "PGRST116") {
        throw paymentError;
      }

      if (payments) {
        setPaymentAmount(payments.amount.toString());
        setShovelerPaymentInfo(payments);
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch payment details"
      );
    }
  };

  if (!isOpen || !job) return null;

  const baseAmount = parseFloat(paymentAmount);
  const tipAmount = parseFloat(tip);
  const totalAmount = baseAmount + tipAmount;

  const handleSubmit = async () => {
    setError(null);

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    try {
      // Submit total amount (base + tip)
      await onSubmit(job.id, shovelerPaymentInfo.shoveler_id, totalAmount);
      setPaymentAmount("");
      setTip("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process payment"
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPaymentAmount("");
      setTip("");
      setNotes("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Payment</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="job-info">
            <h3>{job.address}</h3>
            <p>{job.city}</p>
            <p className="job-date">
              📅{" "}
              {new Date(job.preferred_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {job.shovelerName && (
              <p className="shoveler-name">
                👷 Shoveler: <strong>{job.shovelerName}</strong>
              </p>
            )}
            {job.completedAt && (
              <p className="completed-date">
                ✓ Completed:{" "}
                {new Date(job.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="payment-container">
            <div className="form-group base-payment-container">
              <label htmlFor="amount">
                Base Payment <span className="required">*</span>
              </label>
              <div className="amount-display-wrapper">
                <span className="currency-symbol">$</span>
                <span className="amount-display">
                  {parseFloat(paymentAmount).toFixed(2)}
                </span>
              </div>
              <p className="input-hint">
                This is the calculated payment based on work completed
              </p>
            </div>

            <div className="form-group tip-payment-container">
              <label htmlFor="tip">Tip (Optional)</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="tip"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="tip-input-hint">
                100% of the tip goes directly to the shoveler
              </p>
            </div>
          </div>

          {paymentAmount && (
            <div className="payment-summary">
              <div className="summary-row">
                <span>Base Payment:</span>
                <span className="amount">${baseAmount.toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="summary-row">
                  <span>Tip:</span>
                  <span className="amount tip-amount">
                    +${tipAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total to Pay:</span>
                <span className="amount">
                  ${totalAmount ? totalAmount.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              className="payment-notes"
              placeholder="Add any payment notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={2}
            />
          </div>

          <div className="info-box">
            <p>
              Once you complete this payment, the shoveler will be notified and
              the job will be marked as fully paid.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={isLoading || !paymentAmount}
          >
            {isLoading ? "Processing..." : "Complete Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteJobPaymentModal;
