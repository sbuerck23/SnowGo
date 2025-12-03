import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import HeroSection from "./HeroSection";
import UserSections from "./UserSections";
import HowItWorks from "./HowItWorks";
import ReviewsSection from "./ReviewsSection";
import ServiceAreas from "./ServiceAreas";
import StatsSection from "./StatsSection";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="landing-container">
      <nav className="landing-navbar">
        <div className="navbar-brand">SnowGo</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
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

export default Landing;
