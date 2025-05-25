// components/Auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const EyeIcon = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const Signup = ({ isModal = false, onSuccess = () => {}, onSwitchToLogin = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="max-w-md mx-auto">   
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
            className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
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
            className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.password.label')}
          </label>
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.signup.password.placeholder')}
              className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.confirm_password.label')}
          </label>
          <div className="relative w-full">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('auth.signup.confirm_password.placeholder')}
              className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-oxfordBlue rounded-lg text-white py-2 px-4 hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? t('auth.signup.submit.loading') : t('auth.signup.submit.default')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
    <p className="text-black/50">
      {t('auth.signup.login_prompt')}{' '}
      <button 
        onClick={onSwitchToLogin}
        className="text-oxfordBlue hover:underline bg-transparent border-none p-0 cursor-pointer"
      >
        {t('auth.signup.login_link')}
      </button>
    </p>
  </div>
    </div>
  );
};

export default Signup;