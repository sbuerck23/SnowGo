import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./UserType.css";

type UserType = "customer" | "shoveler" | null;

function UserType() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (type: "customer" | "shoveler") => {
    setLoading(true);
    setError(null);

    try {
      // Update user metadata with user_type
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          user_type: type,
        },
      });

      if (updateError) {
        setError("Failed to save user type. Please try again.");
        console.error(updateError);
        return;
      }

      setSelected(type);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="usertype-container">
      <div className="usertype-content">
        <h1>Welcome to SnowGo!</h1>
        <p className="subtitle">Tell us how you'd like to use SnowGo</p>

        {error && <div className="error-message">{error}</div>}
        {selected && (
          <div className="success-message">
            ✓ Account type set! Redirecting...
          </div>
        )}

        <div className="usertype-options">
          <button
            className={`usertype-card customer-card ${
              selected === "customer" ? "selected" : ""
            }`}
            onClick={() => handleSelect("customer")}
            disabled={loading}
          >
            <div className="card-icon">❄️</div>
            <h2>Need Your Driveway Shoveled?</h2>
            <p>
              Book a trusted local shoveler to handle your snow removal quickly
              and easily.
            </p>
            <ul className="card-benefits">
              <li>Quick booking</li>
              <li>Verified shovelers</li>
              <li>Transparent pricing</li>
            </ul>
            {selected === "customer" && (
              <div className="spinner-container">
                <span className="spinner"></span>
              </div>
            )}
          </button>

          <button
            className={`usertype-card shoveler-card ${
              selected === "shoveler" ? "selected" : ""
            }`}
            onClick={() => handleSelect("shoveler")}
            disabled={loading}
          >
            <div className="card-icon">💼</div>
            <h2>Want to Earn Money Shoveling?</h2>
            <p>
              Turn your snow shoveling skills into income. Work on your own
              schedule and connect with customers.
            </p>
            <ul className="card-benefits">
              <li>Flexible hours</li>
              <li>Keep 80% of earnings</li>
              <li>Build your reputation</li>
            </ul>
            {selected === "shoveler" && (
              <div className="spinner-container">
                <span className="spinner"></span>
              </div>
            )}
          </button>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default UserType;
