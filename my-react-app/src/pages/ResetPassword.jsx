import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import resetImage from '../assets/reset-password.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    document.body.style.backgroundColor = '#D0E7D6';
  }, []);

  // Password validation
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match.");
      setMessageType('error');
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage("Password must be at least 8 characters and include an uppercase letter and a special character.");
      setMessageType('error');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
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
    <div className="min-h-screen flex items-center justify-center bg-[#D0E7D6] px-4">
      <div className="bg-white rounded-xl shadow-md p-8 md:flex items-center w-full max-w-4xl">
        {/* Left - Form */}
        <form onSubmit={handleSubmit} className="md:w-1/2 w-full space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4 text-black">Reset Your Password</h2>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <span
              className="absolute right-3 top-3 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <span
              className="absolute right-3 top-3 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {/* Password Rules */}
          <div className="text-sm text-gray-700 bg-gray-100 border border-gray-200 p-3 rounded-md">
            <p className="mb-1 font-semibold">Password must include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One special character (e.g., !@#$%)</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0E5D35] text-white font-semibold py-2 rounded-md hover:bg-[#2f8d5d] transition"
          >
            Reset Password
          </button>

          {message && (
            <p
              className={`text-sm text-center font-medium ${
                messageType === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Right - Image */}
        <div className="md:w-1/2 w-full mt-6 md:mt-0 flex justify-center">
          <img
            src={resetImage}
            alt="Reset illustration"
            className="max-w-xs w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
