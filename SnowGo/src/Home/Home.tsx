import HeroSection from "./CustomerHome/HeroSection/HeroSection";
import UserSections from "./CustomerHome/UserSections/UserSections";
import HowItWorks from "./CustomerHome/HowItWorks/HowItWorks";
import ReviewsSection from "./CustomerHome/ReviewsSection/ReviewsSection";
import ServiceAreas from "./CustomerHome/ServiceAreas/ServiceAreas";
import StatsSection from "./CustomerHome/StatsSection/StatsSection";
import "./Home.css";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type UserType from "../UserType/UserType";
import ShovelerHome from "./ShovelerHome/ShovelerHome";
import CustomerHome from "./CustomerHome/CustomerHome";
import Navbar from "./Navbar/Navbar";

function Home() {
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
    setUsername("");
    setUserType(null);
  };

  if (!username) {
    return (
      <>
        <Navbar username={username} onLogout={handleLogout} />
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
        <CustomerHome username={username} onLogout={handleLogout} />
      </>
    );
  }

  //User type is shoveler
  return (
    <>
      <ShovelerHome username={username} onLogout={handleLogout} />
    </>
  );
}

export default Home;
