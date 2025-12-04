import "./HowItWorks.css";

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How SnowGo Works</h2>
      <div className="how-tabs">
        <div className="tab-content">
          <h3 className="tab-title">For Customers</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Post Request</h4>
              <p>Post your driveway details and preferred time</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Browse Shovelers</h4>
              <p>View available shovelers and their ratings</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Book & Pay</h4>
              <p>Confirm booking and pay securely online</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Get Service</h4>
              <p>Shoveler arrives and clears your driveway</p>
            </div>
          </div>
        </div>

        <div className="tab-content">
          <h3 className="tab-title">For Shovelers</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Create Profile</h4>
              <p>Set up your profile and availability</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Browse Jobs</h4>
              <p>See shoveling requests in your area</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Accept & Schedule</h4>
              <p>Accept jobs and agree on timing</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Complete & Earn</h4>
              <p>Complete the job and get paid</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
