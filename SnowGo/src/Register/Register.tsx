import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Validate full name
    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      console.log("User registered successfully:", data);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      console.error("Error registering user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Sign Up</h1>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            ✓ Account created! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min. 6 characters)"
            required
            disabled={loading}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <span className="spinner-container">
                <span className="spinner"></span>
                <span>Signing Up...</span>
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <button
            className="link-btn"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Login
          </button>
        </p>
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

export default Register;
