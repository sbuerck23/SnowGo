import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get username from user metadata
        const name = user.user_metadata?.full_name;
        setUsername(name);
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

export default Landing;
