import React from 'react';
import '../styles/AiCheck.css';
import aicheckImg from '../assets/aicheck.png';
import { Link } from "react-router-dom";


const AiCheck = () => {
  return (
    <section className="aicheck-section">
      <div className="aicheck-container">
        <div className="aicheck-text">
          <h2>
            Try <span>AI-Powered</span><br />
            Diagnostics<br />Now
          </h2>
          <p>
            Upload your scan and get instant AI analysis with expert insights.
          </p>
          <Link to="/ai-check" className="aicheck-btn">
            AI CHECK
          </Link>
        </div>
        <div className="aicheck-image">
          <img src={aicheckImg} alt="AI Check" />
        </div>
      </div>
    </section>
  );
};

export default AiCheck;