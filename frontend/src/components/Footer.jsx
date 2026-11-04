import { Link } from "react-router-dom";
import '../styles/Footer.css';
import logo from '../assets/Logo.svg'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
          <img src={logo} alt="Logo" className="logo-img" />
          </div>
  
          <hr className="footer-divider" />
  
          <div className="footer-columns">
            <div className="footer-column">
              <h4>Learn more</h4>
              <ul>
                <li><Link to="/">HOME</Link></li>
                <li><Link to="/about-us">ABOUT</Link></li>
                <li><Link to="/login">MyAccount</Link></li>
                <li><Link to="/contact-us">CONTACT</Link></li>
              </ul>
            </div>
  
            <div className="footer-column">
              <h4>Contact Us</h4>
              <p><strong>Phone Number:</strong> 📞 +012 3456 789</p>
              <p><strong>E-mail:</strong> ✉️ elhakimai@gmail.com</p>
            </div>
  
            <div className="footer-column">
              <h4>Social</h4>
              <div className="social-icons">
                <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
                <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
                <a href="#"><FontAwesomeIcon icon={faFacebook} /></a>
              </div>
            </div>
          </div>
  
          <hr className="footer-divider" />
  
          <div className="footer-bottom">
            <p>© 2025 ElHakim AI. All rights reserved.</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  