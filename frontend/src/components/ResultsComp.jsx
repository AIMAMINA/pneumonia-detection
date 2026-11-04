import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ResultsComp.css';

const ResultsComp = () => {
  const [scans, setScans] = useState([]);
  const [expandedScanIndex, setExpandedScanIndex] = useState(null);
  const [results, setResults] = useState({});
  const backendURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${backendURL}/api/user/scans/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      }
    })
    .then(res => setScans(res.data))
    .catch(err => console.error(err));
  }, []);

  const handleCheck = async (scanUrl, idx) => {
    try {
      const response = await fetch(scanUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('scan', blob, 'scan.jpg');

      const res = await axios.post(`${backendURL}/api/predict-scan-free/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      const { prediction, text, uses_left } = res.data;

      setResults(prev => ({
        ...prev,
        [idx]: {
          text,
          uses_left
        }
      }));
    } catch (err) {
      console.error('Erreur lors de la prédiction AI :', err);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="results-page">
      <h2 className="results-title">Your Medical Results</h2>
      <p className="results-welcome">Hello! Here are the scans associated with your account.</p>

      {scans.length === 0 ? (
        <p className="no-scans">No scans have been uploaded yet.</p>
      ) : (
        <ul className="scan-list">
          {scans.map((scan, idx) => (
            <li key={idx} className="scan-row">
              <div
                className="scan-row-header"
                onClick={() => setExpandedScanIndex(idx === expandedScanIndex ? null : idx)}
              >
                <span className="scan-name">{scan.scan_name || 'X-ray chest'}</span>
                <span className="scan-date">{new Date(scan.upload_date).toLocaleString()}</span>
              </div>

              {expandedScanIndex === idx && (
                <div className="scan-details">
                  <p><strong>Description:</strong> {scan.description || ''}</p>
                  <img
                    src={`${backendURL}${scan.scan_file}`}
                    alt="X-ray"
                    className="scan-image"
                  />
                  <div className="btn-group">
                    <button
                      className="ai-check-btn"
                      onClick={() => handleCheck(`${backendURL}${scan.scan_file}`, idx)}
                    >
                      AI Check
                    </button>
                    <button
                      className="download-btn"
                      onClick={() =>
                        handleDownload(`${backendURL}${scan.scan_file}`, `${scan.scan_name || 'scan'}.jpg`)
                      }
                    >
                      Download
                    </button>
                  </div>
                  {results[idx] && (
                    <div className="ai-result">
                      <p><strong>AI Result:</strong> {results[idx].text}</p>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsComp;
