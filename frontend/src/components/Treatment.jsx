import '../styles/Treatment.css';
import treatment1 from '../assets/treatment1.svg';
import treatment2 from '../assets/treatment2.svg';
import treatment3 from '../assets/treatment3.svg';

function Treatment() {
  return (
    <section className="treatment-section">
      <div className="container">
        <p className="small-title">Features</p>
        <h2 className="section-title">State of the art <br /> treatment</h2>

        <div className="treatment-cards">
          <div className="treatment-card">
            <div className="treatment-image-wrapper">
              <img src={treatment1} alt="X-ray AI" />
              <div className="overlay">
                <p>AI enhances accuracy and speed in X-ray interpretation.</p>
              </div>
            </div>
            <div className="treatment-label">AI-Powered X-Ray Analysis</div>
          </div>

          <div className="treatment-card">
            <div className="treatment-image-wrapper">
              <img src={treatment2} alt="X-ray scans" />
              <div className="overlay">
                <p>Quick and detailed X-ray scans for early diagnosis.</p>
              </div>
            </div>
            <div className="treatment-label">X-ray scans</div>
          </div>

          <div className="treatment-card">
            <div className="treatment-image-wrapper">
              <img src={treatment3} alt="Consultations" />
              <div className="overlay">
                <p>Personalized consultations with expert doctors.</p>
              </div>
            </div>
            <div className="treatment-label">Consultations</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Treatment;
