import Form from "../components/form";
import { Link } from "react-router-dom";
import "/src/styles/LogSign.css";
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-container">
        <div className="nav-container">
          <nav>
            <div className="logo">
              <img src="/src/assets/logo.svg"/>
              <h2>AlHakim AI</h2>
            </div>
            <div className="links">
              <Link to="/" className="link">Home</Link>
              <Link to="/about-us" className="link">About Us</Link>
              <Link to="/contact-us" className="link">Contact Us</Link>
            </div>
          </nav>
          <div className="buttons">
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        </div>
        <div className="content-container">
          <div className="responsive-flex">
            <img 
              src="/src/assets/login.svg"
              className="responsive-image"
              alt="Login illustration"
            />
            <div className="responsive-form">
              <Form route="/api/token/" method="login" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;