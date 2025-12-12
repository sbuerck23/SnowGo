import HeroSection from "./CustomerHome/HeroSection/HeroSection";
import UserSections from "./CustomerHome/UserSections/UserSections";
import HowItWorks from "./CustomerHome/HowItWorks/HowItWorks";
import ReviewsSection from "./CustomerHome/ReviewsSection/ReviewsSection";
import ServiceAreas from "./CustomerHome/ServiceAreas/ServiceAreas";
import StatsSection from "./CustomerHome/StatsSection/StatsSection";
import "./Home.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type UserType from "../UserType/UserType";
import { useNavigate } from "react-router-dom";
import ShovelerLanding from "./ShovelerHome/ShovelerLanding";
import CustomerLanding from "./CustomerHome/CustomerLanding";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [userType, setUserType] = useState<"customer" | "shoveler" | null>(
    null
  );

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Get username from user metadata
          const name = user.user_metadata?.full_name;
          setUsername(name);

          // Get user type from auth metadata
          const type = user.user_metadata?.user_type as UserType;
          setUserType(type);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!username) {
    return (
      <>
        <nav className="landing-navbar">
          <div className="navbar-brand">SnowGo</div>
          <div className="navbar-content login-signup-buttons">
            <button className="logout-btn" onClick={() => navigate("/login")}>
              Log In
            </button>
            <button className="logout-btn" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        </nav>
        <HeroSection />
        <UserSections />
        <HowItWorks />
        <ReviewsSection />
        <ServiceAreas />
        <StatsSection />
      </>
    );
  }

  if (userType === "customer") {
    return (
      <>
        <CustomerLanding username={username} onLogout={handleLogout} />
      </>
    );
  }

  //User type is shoveler
  return (
    <>
      <ShovelerLanding username={username} onLogout={handleLogout} />
    </>
  );
}

export default Home;
