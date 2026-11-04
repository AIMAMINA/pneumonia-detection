import { useState } from 'react';
import '../styles/HowItWorks.css';

import img1 from '../assets/Uploadyourscan.svg';
import img2 from '../assets/AIScan.svg';
import img3 from '../assets/getyourreport.svg';
import img4 from '../assets/talktoyourdoctor.svg';

const steps = [
  {
    title: 'Upload Your Scan',
    description: 'Easily upload your medical scan from your phone or device.',
    image: img1
  },
  {
    title: 'AI Analysis',
    description: 'Our smart AI reviews it instantly for signs of disease.',
    image: img2
  },
  {
    title: 'Get Your Report',
    description: 'You’ll receive an accurate and detailed diagnosis report.',
    image: img3
  },
  {
    title: 'Consult a Doctor',
    description: 'Connect directly with a specialist for real medical advice.',
    image: img4
  },
];

function HowItWorks() {
  const [index, setIndex] = useState(null); // null = rien de sélectionné

  const handleClick = (i) => {
    setIndex(prev => prev === i ? null : i); // toggle si déjà ouvert
  };

  return (
    <section className="how-artistic">
      <div className="how-text-side">
        <h2 className="how-heading">How It Works ?</h2>
        <div className="step-list">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-item ${i === index ? 'active' : ''}`}
              onClick={() => handleClick(i)}
            >
              <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>

              {/* Mobile image only if active */}
              <img
                src={step.image}
                alt={step.title}
                className={`how-img-mobile ${i === index ? 'active' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="how-image-side">
        <div className="image-stack">
          {steps.map((step, i) => (
            <img
              key={i}
              src={step.image}
              alt={step.title}
              className={`how-img ${i === index ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="dot-controls">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => handleClick(i)}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default HowItWorks;
