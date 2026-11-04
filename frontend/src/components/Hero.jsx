import '../styles/Hero.css';
import heroBg from '../assets/hero-bg.svg';
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="overlay black"></div>
      <div className="overlay gradient"></div>

      <div className="container">
        <div className="hero-box">
          <p className="subtitle">
            Transforming Healthcare with <span className="highlight">AI</span>
          </p>
          <h1>
            Early Detection Saves Lives.<br />AI Makes It Faster.
          </h1>
          <p className="description">
            Waiting for test results is stressful. Our AI-driven platform helps detect issues early and connects you with experts, so you can take action fast.
          </p>

        </div>
        <Link to="/appointment" className="btn get-appointment-btn">
            Get Appointment
        </Link>
      </div>

      <div className="hero-bottom-shape"></div>
    </section>
  );
}

export default Hero;
