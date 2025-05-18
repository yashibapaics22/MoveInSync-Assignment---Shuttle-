import React, { useState } from 'react';

const PaymentMethod = ({ onSubmit, buttonText = 'Pay Now', amount }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardNumber.trim() || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cvv.trim() || !/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'Please enter a valid CVV code';
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const paymentData = {
        paymentMethod,
        cardDetails: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          cardholderName
        },
        amount
      };
      
      onSubmit(paymentData);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="payment-method">
      <form onSubmit={handleSubmit}>
        <div className="payment-method-options">
          <div className="form-check">
            <input
              type="radio"
              id="credit_card"
              name="paymentMethod"
              value="credit_card"
              checked={paymentMethod === 'credit_card'}
              onChange={() => setPaymentMethod('credit_card')}
              className="form-check-input"
            />
            <label htmlFor="credit_card" className="form-check-label">Credit Card</label>
          </div>
          
          <div className="form-check">
            <input
              type="radio"
              id="debit_card"
              name="paymentMethod"
              value="debit_card"
              checked={paymentMethod === 'debit_card'}
              onChange={() => setPaymentMethod('debit_card')}
              className="form-check-input"
            />
            <label htmlFor="debit_card" className="form-check-label">Debit Card</label>
          </div>
        </div>
        
        <div className="card-details">
          <div className="form-group">
            <label htmlFor="cardholderName">Cardholder Name</label>
            <input
              type="text"
              id="cardholderName"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              className={`form-control ${errors.cardholderName ? 'is-invalid' : ''}`}
            />
            {errors.cardholderName && <div className="invalid-feedback">{errors.cardholderName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
            />
            {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                maxLength="5"
                className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
              />
              {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
            </div>
            
            <div className="form-group col-md-6">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength="4"
                className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
              />
              {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
            </div>
          </div>
        </div>
        
        {amount && (
          <div className="payment-amount">
            <p>Amount to pay: <strong>${amount.toFixed(2)}</strong></p>
          </div>
        )}
        
        <button type="submit" className="btn btn-primary btn-block">
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default PaymentMethod; 