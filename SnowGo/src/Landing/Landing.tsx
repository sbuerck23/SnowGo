import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CustomerLanding from "../Home/CustomerHome/CustomerLanding";
import ShovelerLanding from "../Home/ShovelerHome/ShovelerLanding";
import "./Landing.css";

type UserType = "customer" | "shoveler" | null;

function Landing() {
  const [username, setUsername] = useState<string>("");
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="landing-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Customer Landing Page
  if (userType === "customer") {
    return <CustomerLanding username={username} onLogout={handleLogout} />;
  }

  // Shoveler Landing Page
  if (userType === "shoveler") {
    return <ShovelerLanding username={username} onLogout={handleLogout} />;
  }
}

export default Landing;
