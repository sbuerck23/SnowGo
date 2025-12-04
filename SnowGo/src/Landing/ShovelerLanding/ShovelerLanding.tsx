import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AvailableJobs from "./AvailableJobs/AvailableJobs";
import YourEarnings from "./YourEarnings/YourEarnings";
import YourProfile from "./YourProfile/YourProfile";

interface ShovelerLandingProps {
  username: string;
  onLogout: () => Promise<void>;
}

type CurrentPage = "dashboard" | "jobs" | "earnings" | "profile";

function ShovelerLanding({ username, onLogout }: ShovelerLandingProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<CurrentPage>("dashboard");

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
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
    </div>
  );
}

export default ShovelerLanding;
