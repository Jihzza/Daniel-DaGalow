// components/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setMessage('Password reset instructions sent to your email.');
    } catch (error) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">Reset Password</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-oxfordBlue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          <Link to="/login" className="text-oxfordBlue hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;