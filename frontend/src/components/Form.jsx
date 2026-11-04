import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
  const isLogin = method === "login"; // Check if it's login or register
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requestData = isLogin 
    ? { username, password } 
    : { username, password, email };

    try {
      const res = await api.post(route, requestData);

      if (isLogin) {
        // Store tokens in localStorage if logging in
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        navigate("/"); // Redirect to Home Page
      } else {
        // Redirect to login page after registration
        navigate("/login");
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1 className="title">{isLogin ? "Welcome Back" : "Create An Account"}</h1>
      <button className="google">
        <img src="/src/assets/icons/google.svg" alt="Google" />
        <span>{ isLogin ? "Log in with Google" : "Sign Up with Google"}</span>
      </button>
      <img className="orLine" src="/src/assets/icons/orLine.svg"/>

      <div className="input-container">
        <img src="/src/assets/icons/user.svg"  className="input-icon"/>
        <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      </div>

      {/* Email Field (For Both) */}
      {!isLogin && (
        <div className="input-container">
        <img src="/src/assets/icons/email.svg"  className="input-icon" />
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter you Email"
            required
          />
        </div>
      )}

      {/* Password Field */}
      <div className="input-container">
      <img src="/src/assets/icons/password.svg"  className="input-icon" />
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>
      <button type="submit" className="form-button" disabled={loading}>
        {loading ? "Processing..." : isLogin ? "Login" : "Register"}
      </button>
      {isLogin && (
          <p className="register-p">Not member yet? <Link className="r-link" to="/register" >Create an Account</Link></p>
      )}
      {!isLogin && (
          <p className="register-p">Already Have An Account? <Link className="r-link" to="/login" >Login</Link></p>
      )}
    </form>
  );
}

export default Form;
