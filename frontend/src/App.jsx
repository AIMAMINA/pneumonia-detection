import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AboutUs from "./pages/AboutUs"
import AICheck from "./pages/AICheck"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Contact from "./components/Contact"
import Appointment from "./pages/Appointment";
import Results from "./pages/Results";

function Logout() {
  localStorage.clear()
  return <Navigate to= "/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/ai-check" element={ <ProtectedRoute><AICheck /></ProtectedRoute>} />
          <Route path="/" element={<Landing />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/appointment" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />   
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App