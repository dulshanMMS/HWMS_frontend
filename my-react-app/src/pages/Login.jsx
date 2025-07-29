import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signInImg from '../assets/signIn.jpeg';
import AuthForm from '../components/Login/AuthForm';
import ForgotPassword from '../components/Login/ForgotPassword';
import Navbar from '../components/Login/Navbar';

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign In');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = currentState === 'Sign In'
      ? 'http://localhost:5173/api/auth/signin'
      : 'http://localhost:6001/api/auth/signup';

    const requestData = currentState === 'Sign In'
      ? {
          username: formData.username,
          //email: formData.email,
          password: formData.password
        }
      : { ...formData };

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
          navigate(data.role === 'admin' ? '/admin' : '/user');
        }

        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
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
      <Navbar />

      {/* Image - visible on all screens, top on mobile, left on large screens */}
      <div
        className="w-full lg:w-[65%] h-64 lg:h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${signInImg})` }}
      ></div>

      {/* Form - bottom on mobile, right on large screens */}
      <div className="w-full lg:w-[35%] flex items-center justify-center py-12 px-6 sm:px-8">
        <AuthForm
          currentState={currentState}
          {...formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          message={message}
          messageType={messageType}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          switchState={() => {
            setCurrentState(currentState === 'Sign In' ? 'Sign Up' : 'Sign In');
            setMessage('');
          }}
          setShowForgotPassword={setShowForgotPassword}
        />
      </div>

      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;
