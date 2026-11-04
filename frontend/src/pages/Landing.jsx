import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ACCESS_TOKEN } from '../constants';

import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import Treatment from '../components/Treatment';
import Doctors from '../components/Doctors';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AiCheck from '../components/AiCheck';

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if access token exists on component mount
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    // Remove tokens from storage
    localStorage.removeItem(ACCESS_TOKEN);
    // Update auth state
    setIsAuthenticated(false);
    // Redirect to landing page
    navigate('/');
  };
  return (
    <>
      <NavBar />
      <Hero />
      <Treatment />
      <Doctors />
      <AiCheck />
      <Testimonials />
      <Contact />
      <Footer />
    
    </>
  );
}