import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import signInImg from '../assets/signIn.jpeg'; 

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign In');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = currentState === 'Sign In'
      ? 'http://localhost:5004/api/auth/signin'
      : 'http://localhost:5004/api/auth/signup';

    const requestData = currentState === 'Sign In'
      ? { username, email, password }
      : { firstName, lastName, username, email, password, confirmPassword };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message || 'Operation successful'}`);
        setMessageType('success');

        if (currentState === 'Sign In') {
          localStorage.setItem('user', JSON.stringify(data));
          localStorage.setItem('token', data.token);

          navigate('/datebooking');

          if (data.role === 'admin') {
            navigate('/datebooking');

          } else {
            navigate('/datebooking');

          }
        }

        setFirstName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setMessage(`Error: ${data.error || 'Unknown error occurred'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#D0E7D6]">
      {/* Navbar */}
      <nav className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4/5 bg-black/20 backdrop-blur-md p-3 px-6 rounded-xl shadow-md flex justify-between items-center z-10 md:flex">
        <ul className="flex gap-6 text-white font-semibold text-base">
          <li><a href="#">Home</a></li>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Resources</a></li>
        </ul>
        <button className="bg-[#0E5D35] text-white font-bold px-4 py-2 rounded-md hover:bg-[#9cc5a7] hover:text-[#0E5D35] transition">
          Sign In
        </button>
      </nav>

      {/* Image Section */}
      <div
        className="hidden lg:block lg:w-[65%] h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${signInImg})` }}
      ></div>

      {/* Form Section */}
      <div className="w-full lg:w-[35%] flex items-center justify-center py-12 px-8">
        <div className="bg-[#9cc5a7] w-full max-w-md p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-[#3A5C32] mb-4">{currentState}</h2>
          {message && (
            <p className={`text-center font-semibold mb-4 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentState === 'Sign Up' && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full p-2 border border-[#0E5D35] rounded-md"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full p-2 border border-[#0E5D35] rounded-md"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Working Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-[#0E5D35] rounded-md"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 border border-[#0E5D35] rounded-md"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border border-[#0E5D35] rounded-md"
              />
              <span
                className="absolute top-2.5 right-3 text-gray-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {currentState === 'Sign Up' && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-[#0E5D35] rounded-md"
                />
                <span
                  className="absolute top-2.5 right-3 text-gray-600 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            )}

            {currentState === 'Sign In' && (
              <p className="text-[#4335AD] text-sm cursor-pointer">Forgot Password?</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#0E5D35] text-white font-semibold py-2 rounded-md hover:bg-[#3a8c5c] transition"
            >
              {currentState === 'Sign In' ? 'Login' : 'Sign Up'}
            </button>

            <div className="text-center text-gray-800">
              <p>
                {currentState === 'Sign In'
                  ? 'Do not have an account yet?'
                  : 'Already have an account?'}{' '}
                <span
                  className="text-[#4335AD] cursor-pointer font-semibold"
                  onClick={() => {
                    setCurrentState(currentState === 'Sign In' ? 'Sign Up' : 'Sign In');
                    setMessage('');
                  }}
                >
                  {currentState === 'Sign In' ? 'Sign Up' : 'Sign In'}
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
