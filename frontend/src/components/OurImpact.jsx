import "../styles/OurImpact.css";
import impactBg from "../assets/carte.svg";

function OurImpact() {
  return (
    <section className="impact-section">
      <h2 className="impact-title">Our Impact</h2>

      <div className="impact-background" style={{ backgroundImage: `url(${impactBg})` }}>
        <div className="impact-cards">
          <div className="impact-card">
            <h3>20,000+</h3>
            <p>Scans Analyzed</p>
          </div>
          <div className="impact-card">
            <h3>10,000+</h3>
            <p>Lives Touched</p>
          </div>
          <div className="impact-card">
            <h3>90% Less</h3>
            <p>Waiting Time</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurImpact;
