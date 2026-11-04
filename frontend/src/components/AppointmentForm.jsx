import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GetAppointment.css';
import doc1 from '../assets/doctor1.png';
import doc2 from '../assets/doctor2.png';
import doc3 from '../assets/doctor3.png';

const API_URL = import.meta.env.VITE_API_URL;

const GetConsult = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    date: '',
    time: '',
    notes: ''
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLoading, setTimeLoading] = useState(false);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await fetch(`${API_URL}/api/available-dates/`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const formatted = data.map(item => ({
          value: item.id,
          label: new Date(item.date).toLocaleDateString(),
          date: item.date
        }));
        setAvailableDates(formatted);
      } catch (error) {
        setMessage(`Error loading dates: ${error.message}`);
      }
    };
    fetchDates();
  }, []);

  useEffect(() => {
    const fetchTimes = async () => {
      if (!formData.date) return;
      setTimeLoading(true);
      setAvailableTimes([]);
      setFormData(prev => ({ ...prev, time: '' }));
      const selectedDateObj = availableDates.find(d => d.value == formData.date);
      if (!selectedDateObj) return;
      const formattedDate = new Date(selectedDateObj.date).toISOString().split('T')[0];
      try {
        const response = await axios.get(`${API_URL}/api/available-times/?date=${formattedDate}`);
        const formatted = response.data.map(item => ({
          value: item.id,
          label: item.time
        }));
        setAvailableTimes(formatted);
      } catch (error) {
        setMessage(`Error loading times: ${error.message}`);
      } finally {
        setTimeLoading(false);
      }
    };
    fetchTimes();
  }, [formData.date]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/appointments/`, formData);
      setMessage('Appointment booked successfully!');
      setFormData({
        full_name: '',
        phone_number: '',
        email: '',
        date: '',
        time: '',
        notes: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="get-consult">
      <div className="consult-container">
        <div className="consult-top">
          <div className="consult-text">
            <h2>
              Get Consult <br />
              With Our <span>Experts !</span>
            </h2>
            <p>
              Book your medical appointment in seconds. <br />
              Choose a date and time slot that suits you best, and you're ready to go.
            </p>
          </div>
          <div className="doctor-circle">
            <img src={doc1} alt="Doctor 1" />
            <img src={doc2} alt="Doctor 2" />
            <img src={doc3} alt="Doctor 3" />
          </div>
        </div>
        <div className="appointment-card">
          <h4>Book Your Appointment</h4>
          <form className="form-group" onSubmit={handleSubmit}>
            <input type="text" name="full_name" placeholder="Full Name" className="select-box" value={formData.full_name} onChange={handleChange} required />
            <input type="text" name="phone_number" placeholder="Phone Number" className="select-box" value={formData.phone_number} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className="select-box" value={formData.email} onChange={handleChange} />
            <textarea name="notes" placeholder="Notes" rows="3" className="select-box" value={formData.notes} onChange={handleChange} />
            <select name="date" className="select-box" value={formData.date} onChange={handleChange} required>
              <option value="">Select a date</option>
              {availableDates.map(dateObj => (
                <option key={dateObj.value} value={dateObj.value}>{dateObj.label}</option>
              ))}
            </select>
            {formData.date && (
              timeLoading ? <p>Loading times...</p> :
              availableTimes.length > 0 ? (
                <select name="time" className="select-box" value={formData.time} onChange={handleChange} required>
                  <option value="">Select a time</option>
                  {availableTimes.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
              ) : <p>No available times for this date</p>
            )}
            <button type="submit" className="book-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          </form>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    </section>
  );
};

export default GetConsult;