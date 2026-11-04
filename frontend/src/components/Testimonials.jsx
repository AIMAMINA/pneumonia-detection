import '../styles/Testimonials.css';
import client1 from '../assets/client1.svg';
import client2 from '../assets/client2.svg';
import client3 from '../assets/client3.svg';
import client4 from '../assets/client4.svg';

import { useEffect, useRef, useState } from "react";

function Testimonials() {
  const trackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    { name: "John D.", image: client1, feedback: "I’ve been consistently impressed with the quality and service..." },
    { name: "Emeli", image: client2, feedback: "They have exceeded my expectations and delivered results..." },
    { name: "Mathew", image: client3, feedback: "Highly recommended for their reliability and precision." },
    { name: "Anne", image: client4, feedback: "A seamless experience from start to finish. Amazing!" }
  ];

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    setCurrentIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % testimonials.length;
    setCurrentIndex(nextIndex);
  };

  const getOffset = () => `${currentIndex * 320}px`;

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title-light">Our Satisfied Clients</h2>
        <p className="testimonials-subtitle">
          We use only the best quality materials on the market in order to provide the best products to our patients.
        </p>

        <div className="testimonial-carousel">
          <div className="testimonial-track" ref={trackRef} style={{ transform: `translateX(-${getOffset()})` }}>
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="client-info">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <p className="client-name">{testimonial.name}</p>
                </div>
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="feedback">{testimonial.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots">
          {testimonials.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>

        {/* Flèches visibles uniquement sur petits écrans */}
        <div className="carousel-arrows">
          <button className="arrow prev" onClick={handlePrev}>‹</button>
          <button className="arrow next" onClick={handleNext}>›</button>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
