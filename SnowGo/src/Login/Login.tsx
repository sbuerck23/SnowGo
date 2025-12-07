import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      setSuccess(true);

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      console.error("Error logging in user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Login</h1>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            ✓ Login successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleLogin}>
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
            placeholder="Password"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <span className="spinner-container">
                <span className="spinner"></span>
                <span>Logging In...</span>
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <button
            className="link-btn"
            onClick={() => navigate("/signup")}
            disabled={loading}
          >
            Sign Up
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

export default Login;
