// components/Auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Signup = ({ isModal = false, onSuccess = () => {}}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Password validation
    if (password !== confirmPassword) {
      setError(t('auth.signup.errors.password_mismatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.signup.errors.password_length'));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(email, password, {
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      if (isModal) {
        onSuccess();
      } else {
        setMessage(t('auth.signup.success.message'));
        setTimeout(() => navigate('/login'), 5000);
      }
    } catch (error) {
      setError(error.message || t('auth.signup.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">{t('auth.signup.title')}</h2>
      
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
          <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.full_name.label')}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder={t('auth.signup.full_name.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.email.label')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('auth.signup.email.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.password.label')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('auth.signup.password.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.confirm_password.label')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t('auth.signup.confirm_password.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-oxfordBlue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? t('auth.signup.submit.loading') : t('auth.signup.submit.default')}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t('auth.signup.login_prompt')}{' '}
          <Link to="/login" className="text-oxfordBlue hover:underline">
            {t('auth.signup.login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;