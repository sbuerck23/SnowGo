import { useNavigate } from "react-router-dom";
import CustomerJobs from "./CustomerJobs/CustomerJobs";

interface CustomerLandingProps {
  username: string;
  onLogout: () => Promise<void>;
}

function CustomerLanding({ username, onLogout }: CustomerLandingProps) {
  const navigate = useNavigate();

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
      <CustomerJobs />
      <section className="user-section customer-section">
        <div className="section-content">
          <div className="section-text">
            <h2>Need Your Driveway Shoveled?</h2>
            <p>
              Tired of waking up early to shovel? Let our trusted local
              shovelers handle it for you.
            </p>
            <div className="section-points">
              <div className="point">
                <span className="point-icon">⚡</span>
                <span>Quick booking in minutes</span>
              </div>
              <div className="point">
                <span className="point-icon">✓</span>
                <span>Verified and rated shovelers</span>
              </div>
              <div className="point">
                <span className="point-icon">💰</span>
                <span>Transparent pricing</span>
              </div>
              <div className="point">
                <span className="point-icon">📍</span>
                <span>Available in your area</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/booking")}
            >
              Book a Shoveler
            </button>
          </div>
          <div className="section-image">
            <div className="placeholder-image">📍 Service Request</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerLanding;
