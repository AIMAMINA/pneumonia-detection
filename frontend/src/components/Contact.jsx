import React, { useState } from "react";
import '../styles/Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faInstagram, faFacebook} from '@fortawesome/free-brands-svg-icons';
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
function Contact() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Symptoms Inquiry");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      first_name,
      last_name,
      email,
      phone,
      subject,
      message,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Message sent successfully!");
      } else {
        alert("An error occurred while sending the message.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        {/* Left Side - Image + Info */}
        <div className="contact-info-box">
          <div className="contact-details">
            <h3>Contact Information</h3>
            <p>Say something to start a chat!</p>

            <div className="contact-detail">
            <FontAwesomeIcon icon={faPhone} />
              <span>+1 012 3456 789</span>
            </div>

            <div className="contact-detail">
            <FontAwesomeIcon icon={faEnvelope} />
              <span>elhakimai@gmail.com</span>
            </div>

            <div className="contact-detail">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>Rue Saïdani, Constantine</span>
            </div>

            {/* Embedded Google Map */}
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.8653052221067!2d6.6051887!3d36.3535886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f1773a28f151fd%3A0x19b9201b83024b8d!2sRue%20Sa%C3%AFdani%2C%20Constantine!5e0!3m2!1sfr!2sdz!4v1711834027566!5m2!1sfr!2sdz"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="social-icons">
              <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#"><FontAwesomeIcon icon={faFacebook} /></a>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="First Name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <label>Select Subject:</label>
            <div className="radio-group">
              {["Symptoms Inquiry", "AI Diagnosis Results", "Appointment Booking", "Medical Report Request"].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="subject"
                    value={option}
                    checked={subject === option}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Write your message.."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>

            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;