import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleGetOtpClick = async () => {
    try {
      const response = await fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, action: 'GET_OTP' }),
      });

      if (response.status === 200) {
        setShowOtpInput(true);
      }
    } catch (error) {
      console.error('Error getting OTP:', error);
    }
  };

  const handleLoginClick = async () => {
    try {
      const response = await fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, action: 'VALIDATE_OTP' }),
      });

      if (response.status === 200) {
        console.log('success');
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
    }
  };


  return (
    <div className="login-page">
      <h2>Login Page</h2>
      <div className="input-container">
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {showOtpInput ? (
        <div className="input-container">
          <label>OTP:</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
        </div>
      ) : (
        <button onClick={handleGetOtpClick}>Get OTP</button>
      )}
      {showOtpInput && <button onClick={handleLoginClick}>Login</button>}
    </div>
  );
};

export default LoginPage;
