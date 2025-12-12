import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CustomerJobs from "./CustomerJobs/CustomerJobs";
import BookingModal from "../../BookingDialog/BookingDialog";
import { supabase } from "../../supabaseClient";

interface CustomerLandingProps {
  username: string;
  onLogout: () => Promise<void>;
}

function CustomerLanding({ username, onLogout }: CustomerLandingProps) {
  const navigate = useNavigate();

  // NEW — modal open/close state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleLogout = async () => {
    await onLogout();
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
  };

  const handleBookingSubmit = async (formData: any) => {
    setShowBookingModal(false);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Please log in to book a shoveler");
        navigate("/login");
        return;
      }

      // Insert booking into database
      const { error: insertError } = await supabase.from("bookings").insert([
        {
          user_id: user.id,
          address: formData.address,
          city: formData.city,
          zip_code: formData.zipCode,
          preferred_date: formData.date,
          preferred_time: formData.time,
          driveway_size: formData.drivewaySize,
          additional_notes: formData.additionalNotes,
          status: "pending",
        },
      ]);

      if (insertError) {
        console.error(insertError);
        return;
      }

      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
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

      <CustomerJobs refreshCounter={refreshCounter} />

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
              onClick={() => setShowBookingModal(true)}
            >
              Book a Shoveler
            </button>
          </div>

          <div className="section-image">
            <div className="placeholder-image">📍 Service Request</div>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={showBookingModal}
        onClose={handleBookingClose}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}

export default CustomerLanding;
