import '../styles/AboutHero.css';
import aboutBg from '../assets/AboutUs.jpg';

function AboutHero() {
  return (
    <section className="about-hero" style={{ backgroundImage: `url(${aboutBg})` }}>
      <div className="overlay"></div>

      <div className="about-content">
        <div className="mission-box">
          <h2>Our Mission</h2>
          
          <p>
            At ElHakim AI, we help you get quick answers about your health. Just upload your scan,
            and our <strong>smart AI</strong> will tell you if there’s a sign of <strong>pneumonia</strong> in seconds.
            Need to talk to a real doctor? You can book an <strong>appointment</strong> or contact them directly
            by email through our platform. It’s safe, simple, and built for everyone — no long waits or complicated steps.
          </p>
        </div>

        <h1 className="about-title">About ElHakim AI</h1>
      </div>
    </section>
  );
}

export default AboutHero;
