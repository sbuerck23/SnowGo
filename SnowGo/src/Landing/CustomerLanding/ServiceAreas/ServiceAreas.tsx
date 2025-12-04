import "./ServiceAreas.css";

function ServiceAreas() {
  const areas = [
    {
      id: 1,
      region: "Midwest",
      cities: "Chicago, Minneapolis, Detroit, Milwaukee, St. Louis",
    },
    {
      id: 2,
      region: "Northeast",
      cities: "Boston, New York, Philadelphia, Pittsburgh, Buffalo",
    },
    {
      id: 3,
      region: "Mountain West",
      cities: "Denver, Salt Lake City, Boise, Fort Collins, Boulder",
    },
    {
      id: 4,
      region: "Great Plains",
      cities: "Omaha, Kansas City, Des Moines, Cedar Rapids",
    },
  ];

  return (
    <section className="service-areas">
      <h2>Service Areas</h2>
      <p className="subtitle">Currently available in these regions</p>
      <div className="areas-grid">
        {areas.map((area) => (
          <div key={area.id} className="area-card">
            <h3>{area.region}</h3>
            <p>{area.cities}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ServiceAreas;
