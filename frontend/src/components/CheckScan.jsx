import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CheckScan.css';
import bgImage from '../assets/aicheck.png';
import { isLoggedIn } from '../../tools/auth';
import PaymentModal from './PaymentModal';
import { authHeaders } from '../api';

const CheckScan = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [usesLeft, setUsesLeft] = useState(0);
  const [error, setError] = useState(null);

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

  useEffect(() => {
    if (isLoggedIn()) {
      fetchUsesLeft();
    }
  }, []);

  const fetchUsesLeft = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/profile/`, authHeaders());
      setUsesLeft(res.data.uses_left || 0);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setUsesLeft(0);
    }
  };

  const handleFileChange = e => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setPreview(URL.createObjectURL(uploaded));
      setResult('');
      setShowResult(false);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      if (usesLeft < 1) {
        setShowPaymentModal(true);
        return;
      }

      const formData = new FormData();
      formData.append('scan', file);

      const scanRes = await axios.post(
        `${API_BASE_URL}/predict-scan/`,
        formData,
        authHeaders()
      );

      setResult(scanRes.data.prediction === 1 ? 'Pneumonia detected' : 'Normal scan');
      setUsesLeft(scanRes.data.uses_left);
      setShowResult(true);

    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      const paymentRes = await axios.post(
        `${API_BASE_URL}/fake-payment/`,
        {},
        authHeaders()
      );
      setUsesLeft(paymentRes.data.total_uses);
      setShowPaymentModal(false);
      if (file) await handleScan();
    } catch (err) {
      handleApiError(err);
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    console.error("API Error:", err);
    if (err.response) {
      switch (err.response.status) {
        case 401: setError("Session expired. Please log in again."); break;
        case 402:
        case 403: setShowPaymentModal(true); break;
        case 400: setError("Invalid file. Please upload a valid X-ray image."); break;
        default: setError("Service unavailable. Please try again later.");
      }
    } else {
      setError("Network error. Please check your connection.");
    }
  };

  const resetScan = () => {
    setFile(null);
    setPreview(null);
    setResult('');
    setShowResult(false);
    fetchUsesLeft();
  };

  const openPdfReport = () => {
    const token = localStorage.getItem("access");
    const resultParam = result.includes("Normal") ? "Normal" : "Pneumonia";

    const url = `${API_BASE_URL}/generate-report/?result=${resultParam}`;

    const newWindow = window.open();
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.blob())
      .then(blob => {
        const pdfUrl = URL.createObjectURL(blob);
        newWindow.location.href = pdfUrl;
      })
      .catch(err => {
        newWindow.close();
        console.error("PDF error:", err);
      });
  };

  return (
    <div className="ai-check-background" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="ai-check-overlay">
        {showPaymentModal && (
          <PaymentModal
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setShowPaymentModal(false);
              setLoading(false);
            }}
          />
        )}

        {!showResult ? (
          <div className="ai-check-card">
            <h2>AI-Powered Pneumonia Detection</h2>
            <p>Upload your chest X-ray for analysis</p>
            {error && <div className="error-message">{error}</div>}
            <label className="upload-button">
              {file ? file.name : 'Select X-ray Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
            <div className="uses-counter">
              Scans remaining: {usesLeft}
            </div>
            <button
              className={`ai-check-btn ${loading ? 'loading' : ''}`}
              onClick={handleScan}
              disabled={!file || loading}
            >
              {loading ? 'Processing...' : 'Analyze Scan'}
            </button>
          </div>
        ) : (
          <div className="result-page">
            <h2 className="result-title">Scan Results</h2>
            <div className="result-card">
              <img src={preview} alt="X-ray preview" />
              <h3 className={result.includes('detected') ? 'warning' : 'normal'}>
                {result}
              </h3>
              <p>Scans remaining: {usesLeft}</p>

              <div className="button-row">
                <button onClick={openPdfReport} className="pdf-btn">
                  View PDF Report
                </button>
                <button onClick={resetScan} className="back-btn">
                  New Scan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckScan;
