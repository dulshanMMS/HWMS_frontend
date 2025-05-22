import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [strength, setStrength] = useState('');

  useEffect(() => {
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    document.body.style.backgroundColor = '#D0E7D6';
  }, []);

  // Evaluate password strength
  useEffect(() => {
    const score = calculatePasswordStrength(newPassword);
    if (score >= 4) setStrength('strong');
    else if (score >= 2) setStrength('medium');
    else if (score > 0) setStrength('weak');
    else setStrength('');
  }, [newPassword]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[\W_]/.test(password)) score++;
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5173/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setMessageType('success');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMessage(data.error);
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Something went wrong.');
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D0E7D6]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fade-in"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-[#3A5C32]">
          Reset Your Password
        </h2>

        <div className="relative mb-2">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onFocus={() => setShowRules(true)}
            onBlur={() => setShowRules(false)}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-400 rounded-md"
          />
          <span
            className="absolute right-3 top-[10px] text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        {/* Password Strength */}
        {strength && (
          <div className="text-sm mb-2 text-center">
            Password strength:{' '}
            <span
              className={`font-bold ${
                strength === 'strong'
                  ? 'text-green-600'
                  : strength === 'medium'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {strength}
            </span>
          </div>
        )}

        {/* Password Rules */}
        {showRules && (
          <ul className="text-sm text-gray-700 bg-gray-100 border p-3 mb-2 rounded">
            <li>• At least 8 characters</li>
            <li>• At least one uppercase letter</li>
            <li>• At least one number</li>
            <li>• At least one special character</li>
          </ul>
        )}

        <button
          type="submit"
          className="w-full bg-[#0E5D35] text-white font-semibold py-2 rounded-md hover:bg-[#3a8c5c] transition"
        >
          Reset Password
        </button>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-sm text-center font-semibold transition-all duration-300 ${
              messageType === 'success' ? 'text-green-600 animate-bounce' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
