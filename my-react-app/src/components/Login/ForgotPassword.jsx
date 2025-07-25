import { useState } from 'react';
import { X } from 'lucide-react'; // optional icon package; or you can use plain "×"

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('Password reset link sent to your email.');
        setStatusType('success');
      } else {
        setStatus(data.error || 'Failed to send reset link.');
        setStatusType('error');
      }
    } catch (err) {
      setStatus('Something went wrong.');
      setStatusType('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-lg w-80">
        {/* Close Icon in Top-Right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <h3 className="text-lg font-bold mb-2 text-center">Forgot Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-400 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-[#0E5D35] text-white font-semibold py-2 rounded-md hover:bg-[#3a8c5c] transition"
          >
            Send Reset Link
          </button>
        </form>
        {status && (
          <p className={`mt-2 text-sm ${statusType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
