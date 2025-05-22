import React from 'react';
import GeneralFormInput from '../shared/GeneralFormInput';

const AuthForm = ({
  currentState,
  firstName,
  lastName,
  username,
  email,
  password,
  confirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleChange,
  handleSubmit,
  message,
  messageType,
  switchState,
  setShowForgotPassword
}) => {
  return (
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
            <GeneralFormInput
              type="text"
              value={firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="First Name"
            />
            <GeneralFormInput
              type="text"
              value={lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
            <GeneralFormInput
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Working Email"
            />
          </>
        )}
        
        <GeneralFormInput
          type="text"
          value={username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="Username"
        />
        <GeneralFormInput
          type="password"
          value={password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Password"
          showToggle={true}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        {currentState === 'Sign Up' && (
          <GeneralFormInput
            type="password"
            value={confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Confirm Password"
            showToggle={true}
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
          />
        )}

        {currentState === 'Sign In' && (
            <p
                className="text-[#4335AD] text-sm cursor-pointer hover:underline"
                onClick={() => setShowForgotPassword(true)}
            >
                Forgot Password?
            </p>
        )}

        <button type="submit" className="w-full bg-[#0E5D35] text-white font-semibold py-2 rounded-md hover:bg-[#3a8c5c] transition">
          {currentState === 'Sign In' ? 'Login' : 'Sign Up'}
        </button>

        <div className="text-center text-gray-800">
          <p>
            {currentState === 'Sign In' ? "Do not have an account?" : 'Already have an account?'}{' '}
            <span className="text-[#4335AD] cursor-pointer font-semibold" onClick={switchState}>
              {currentState === 'Sign In' ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
