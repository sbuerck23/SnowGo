import "./ReviewsSection.css";

function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      location: "Chicago, IL",
      text: "Amazing service! John showed up early and cleared my entire driveway in 30 minutes. Highly recommend!",
      rating: 5,
    },
    {
      id: 2,
      name: "Mike T.",
      location: "Minneapolis, MN",
      text: "Great experience! The shoveler was professional and did an excellent job. Will definitely use again!",
      rating: 5,
    },
    {
      id: 3,
      name: "Jennifer L.",
      location: "Denver, CO",
      text: "SnowGo made it so easy! The booking process was quick and the shoveler was punctual and efficient.",
      rating: 5,
    },
    {
      id: 4,
      name: "David K.",
      location: "Boston, MA",
      text: "Best decision ever! No more back pain from shoveling. Worth every penny!",
      rating: 5,
    },
  ];

  return (
    <section className="reviews">
      <h2>What Our Customers Say</h2>
      <div className="review-grid">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <h4>{review.name}</h4>
                <p>{review.location}</p>
              </div>
              <div className="review-stars">{"★".repeat(review.rating)}</div>
            </div>
            <p className="review-text">"{review.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReviewsSection;
