import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection/HeroSection";
import UserSections from "./UserSections/UserSections";
import HowItWorks from "./HowItWorks/HowItWorks";
import ReviewsSection from "./ReviewsSection/ReviewsSection";
import ServiceAreas from "./ServiceAreas/ServiceAreas";
import StatsSection from "./StatsSection/StatsSection";

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
      <HeroSection />
      <UserSections />
      <HowItWorks />
      <ReviewsSection />
      <ServiceAreas />
      <StatsSection />
    </div>
  );
}

export default CustomerLanding;
