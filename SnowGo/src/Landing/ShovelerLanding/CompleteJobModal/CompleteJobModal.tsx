import { useState } from "react";
import "./CompleteJobModal.css";

interface CompleteJobModalProps {
  isOpen: boolean;
  job: {
    id: string;
    address: string;
    city: string;
    preferred_date: string;
    hourly_rate: number;
  } | null;
  onClose: () => void;
  onSubmit: (hours: number, notes: string) => Promise<void>;
  isLoading: boolean;
}

function CompleteJobModal({
  isOpen,
  job,
  onClose,
  onSubmit,
  isLoading,
}: CompleteJobModalProps) {
  const [hours, setHours] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const calculatedPay = hours
    ? (parseFloat(hours) * job.hourly_rate).toFixed(2)
    : "0.00";

  const handleSubmit = async () => {
    setError(null);

    if (!hours || parseFloat(hours) <= 0) {
      setError("Please enter a valid number of hours");
      return;
    }

    try {
      await onSubmit(parseFloat(hours), notes);
      setHours("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete job");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setHours("");
      setNotes("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Job</h2>
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
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="hours">
              Hours Worked <span className="required">*</span>
            </label>
            <div className="hours-input-wrapper">
              <input
                type="number"
                id="hours"
                min="0.25"
                step="0.25"
                placeholder="e.g., 2.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                disabled={isLoading}
              />
              <span className="hours-label">hours</span>
            </div>
          </div>

          {hours && (
            <div className="payment-preview">
              <div className="payment-row">
                <span>Hourly Rate:</span>
                <span>${job.hourly_rate}/hr</span>
              </div>
              <div className="payment-row">
                <span>Hours Worked:</span>
                <span>{hours}</span>
              </div>
              <div className="payment-row total">
                <span>Total Payment:</span>
                <span>${calculatedPay}</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              placeholder="Add any notes about the job completion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
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
            disabled={isLoading || !hours}
          >
            {isLoading ? "Completing..." : "Complete Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteJobModal;
