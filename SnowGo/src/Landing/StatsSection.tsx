import "./StatsSection.css";

function StatsSection() {
  const stats = [
    { id: 1, number: "500+", label: "Active Shovelers" },
    { id: 2, number: "2,500+", label: "Driveways Cleared" },
    { id: 3, number: "4.9★", label: "Average Rating" },
  ];

  return (
    <section className="stats">
      {stats.map((stat) => (
        <div key={stat.id} className="stat">
          <h3>{stat.number}</h3>
          <p>{stat.label}</p>
        </div>
      ))}
    </section>
  );
}

export default StatsSection;
