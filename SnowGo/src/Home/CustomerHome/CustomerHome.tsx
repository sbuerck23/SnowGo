import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CustomerJobs from "./CustomerJobs/CustomerJobs";
import BookingDialog from "../../BookingDialog/BookingDialog";
import { supabase } from "../../supabaseClient";
import Navbar from "../Navbar/Navbar";
import "./CustomerHome.css";

interface CustomerHomeProps {
  username: string;
  onLogout: () => Promise<void>;
}

function CustomerHome({ username, onLogout }: CustomerHomeProps) {
  const navigate = useNavigate();

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
    <>
      <Navbar username={username} onLogout={handleLogout} />
      <div className="landing-container">
        <CustomerJobs refreshCounter={refreshCounter} />

        <section className="booking-button-section">
          <div className="booking-button-container">
            <h2>Ready to Book?</h2>
            <p>Get your driveway cleared by a trusted shoveler today</p>
            <button
              className="btn btn-primary btn-large"
              onClick={() => setShowBookingModal(true)}
            >
              Book a Shoveler
            </button>
          </div>
        </section>

        <BookingDialog
          isOpen={showBookingModal}
          onClose={handleBookingClose}
          onSubmit={handleBookingSubmit}
        />
      </div>
    </>
  );
}

export default CustomerHome;
