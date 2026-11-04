import React from 'react';
import '../styles/Doctors.css';
import doctor1 from '../assets/doctor_1.png';
import doctor2 from '../assets/doctor_2.png';
import doctor3 from '../assets/doctor_3.png';


function Doctors() {
  return (
    <section className="doctors-section">
      <div className="container">
        <p className="small-title">Our Team</p>
        <h2 className="section-title">Meet our <br /> doctors</h2>

        <div className="doctors-cards">
          <div className="doctor-card">
            <img src={doctor1} alt="Dr. Bensalem" />
            <h3>Dr. Bensalem</h3>
            <p className="specialty">Radiologist</p>
            <p className="description">
              Expert in early detection of cardiovascular diseases using advanced imaging techniques.
            </p>
            <div className="contact-overlay">
              <p><strong>Email:</strong> bensalem@elhakim.dz</p>
              <p><strong>Phone:</strong> +213 661 23 45 67</p>
            </div>
          </div>

          <div className="doctor-card">
            <img src={doctor2} alt="Dr. Amina Lounis" />
            <h3>Dr. Amina Lounis</h3>
            <p className="specialty">Cardiologist</p>
            <p className="description">
              Specialist in AI-assisted medical imaging for fast and precise diagnostics.
            </p>
            <div className="contact-overlay">
              <p><strong>Email:</strong> amina@elhakim.dz</p>
              <p><strong>Phone:</strong> +213 662 11 22 33</p>
            </div>
          </div>

          <div className="doctor-card">
            <img src={doctor3} alt="Dr. Yacine Mechri" />
            <h3>Dr. Yacine Mechri</h3>
            <p className="specialty">Oncologist</p>
            <p className="description">
              Focused on early cancer detection and AI-powered treatment strategies.
            </p>
            <div className="contact-overlay">
              <p><strong>Email:</strong> yacine@elhakim.dz</p>
              <p><strong>Phone:</strong> +213 669 88 99 00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Doctors;