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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear previous messages when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const validateForm = () => {
    if (currentState === 'Sign In') {
      if (!formData.username || !formData.password) {
        setMessage('Username and password are required');
        setMessageType('error');
        return false;
      }
    } else {
      // Sign Up validation
      if (!formData.username || !formData.email || !formData.password) {
        setMessage('Username, email, and password are required');
        setMessageType('error');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match');
        setMessageType('error');
        return false;
      }
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters long');
        setMessageType('error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    const endpoint = currentState === 'Sign In'
      ? 'http://localhost:5004/api/auth/signin'
      : 'http://localhost:5004/api/auth/signup';

    // Prepare request data based on current state
    const requestData = currentState === 'Sign In'
      ? {
          username: formData.username,
          password: formData.password
        }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password
        };

    try {
      console.log('Sending request to:', endpoint);
      console.log('Request data:', requestData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        setMessage(`Success: ${data.message || 'Operation successful'}`);
        setMessageType('success');

        if (currentState === 'Sign In') {
          // Store user data and token
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.user.role);

          // Navigate based on user role
          setTimeout(() => {
            if (data.user && data.user.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/user');
            }
          }, 1000);
        } else {
          // After successful signup, switch to sign in
          setCurrentState('Sign In');
          setMessage('Registration successful! Please sign in with your credentials.');
          setMessageType('success');
          
          // Clear form except username for convenience
          setFormData({
            firstName: '',
            lastName: '',
            username: formData.username, // Keep username for easy login
            email: '',
            password: '',
            confirmPassword: ''
          });
        }
      } else {
        setMessage(`Error: ${data.error || data.message || 'Unknown error occurred'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Request failed:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setMessage('');
    setMessageType('');
  };

  const switchState = () => {
    setCurrentState(currentState === 'Sign In' ? 'Sign Up' : 'Sign In');
    clearForm();
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#D0E7D6]">
      <Navbar />
      
      {/* Background Image Section */}
      <div
        className="hidden lg:block lg:w-[65%] h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${signInImg})` }}
      ></div>
      
      {/* Form Section */}
      <div className="w-full lg:w-[35%] flex items-center justify-center py-12 px-8">
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
          switchState={switchState}
          setShowForgotPassword={setShowForgotPassword}
          isLoading={isLoading}
        />
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;