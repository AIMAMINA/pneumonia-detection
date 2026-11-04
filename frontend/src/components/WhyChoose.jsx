import "../styles/WhyChoose.css";
import whyImage from "../assets/why.svg";
import { FaClock, FaLock, FaUserMd } from "react-icons/fa";

function WhyChoose() {
  return (
    <section className="why-choose">
      <div className="why-wrapper">
        <div className="why-left">
          <img src={whyImage} alt="Why ElHakim AI?" className="why-img" />
          <h2 className="why-title">
            Why Choose <br />
            <span>ElHakim AI?</span>
          </h2>
        </div>

        <div className="why-right">
          <div className="why-item">
            <FaClock />
            <span>Fast Results</span>
          </div>
          <div className="why-item">
            <FaLock />
            <span>Safe & Easy</span>
          </div>
          <div className="why-item">
            <FaUserMd />
            <span>Talk To Real Doctors</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;
