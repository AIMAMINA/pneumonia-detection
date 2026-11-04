import React, { useState } from 'react';
import '../styles/PaymentModal.css';
import cibIcon from '../assets/cib.png';
import edahabiaIcon from '../assets/edahabia.png';
import paymentImage from '../assets/payment.svg';

function PaymentModal({ onSuccess, onCancel }) {
  const [fullName, setFullName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paying, setPaying] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleCardChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);

    if (digits.length > 0 && digits.length < 16) {
      setCardError('Card number must be 16 digits');
    } else {
      setCardError('');
    }
  };

  const isCardValid = cardNumber.replace(/\D/g, '').length === 16;

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2)}`;
    setExpiry(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting payment...');
    if (!isCardValid) {
      setCardError('Card number must be 16 digits');
      return;
    }

    setPaying(true);
    setTimeout(() => {
      console.log('Payment successful');
      setPaying(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-image">
          <img src={paymentImage} alt="Secure Payment" />
        </div>

        <div className="modal-card">
          <h3>Complete Your Payment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group card-number-wrapper">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardChange}
                required
              />
              <div className="card-icons">
                <img src={cibIcon} alt="CIB" />
                <span>/</span>
                <img src={edahabiaIcon} alt="Edahabia" />
              </div>
              {cardError && <div className="error-message">{cardError}</div>}
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                required
              />
              <input
                type="text"
                placeholder="CVC"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                required
              />
            </div>

            <div className="form-actions">
            <button type="submit" disabled={paying}>
  {paying ? 'Processing…' : 'Pay 250 DA'}
</button>

              <button
                type="button"
                onClick={onCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
