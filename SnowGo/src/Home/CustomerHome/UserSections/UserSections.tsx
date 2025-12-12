import { useNavigate } from "react-router-dom";
import "./UserSections.css";

function UserSections() {
  const navigate = useNavigate();

  return (
    <>
      {/* For Customers Section */}
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
              onClick={() => navigate("/signup")}
            >
              Book a Shoveler
            </button>
          </div>
          <div className="section-image">
            <div className="placeholder-image">📍 Service Request</div>
          </div>
        </div>
      </section>

      {/* For Shovelers Section */}
      <section className="user-section shoveler-section">
        <div className="section-content">
          <div className="section-image">
            <div className="placeholder-image">💼 Earn Money</div>
          </div>
          <div className="section-text">
            <h2>Want to Make Money Shoveling?</h2>
            <p>
              Turn your snow shoveling skills into income. Work on your own
              schedule and connect with customers who need your help.
            </p>
            <div className="section-points">
              <div className="point">
                <span className="point-icon">🕐</span>
                <span>Set your own hours</span>
              </div>
              <div className="point">
                <span className="point-icon">💵</span>
                <span>Keep 80% of earnings</span>
              </div>
              <div className="point">
                <span className="point-icon">🛡️</span>
                <span>Secure payments</span>
              </div>
              <div className="point">
                <span className="point-icon">⭐</span>
                <span>Build your reputation</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/signup")}
            >
              Become a Shoveler
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default UserSections;
