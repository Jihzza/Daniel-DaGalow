// components/Auth/Login.jsx
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


const Login = ({ isModal = false, onSuccess = () => {}, onForgotPassword = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Call onSuccess if in modal mode
      if (isModal) {
        onSuccess();
      } else {
        // Regular redirect for non-modal
        navigate('/');
      }
    } catch (error) {
      setError(error.message || t('auth.login.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  const bottomSection = !isModal && (
    <div className="mt-6 text-center">
      <p className="text-gray-600">
        {t('auth.login.signup_prompt')}{' '}
        <Link to="/signup" className="text-oxfordBlue hover:underline">
          {t('auth.login.signup_link')}
        </Link>
      </p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto rounded-lg">
      {!isModal && <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">{t('auth.login.title')}</h2>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-black font-medium mb-1">
            {t('auth.login.email.label')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('auth.login.email.placeholder')}
            className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-black font-medium mb-1">
            {t('auth.login.password.label')}
          </label>
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.login.password.placeholder')}
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
        
        <div className="text-right">
        {isModal ? (
            <button 
              type="button"
              onClick={onForgotPassword} 
              className="text-oxfordBlue hover:underline text-sm"
            >
              {t('auth.login.forgot_password')}
            </button>
          ) : (
            <Link to="/forgot-password" className="text-oxfordBlue hover:underline text-sm">
              {t('auth.login.forgot_password')}
            </Link>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-oxfordBlue rounded-lg text-white py-2 px-4 hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? t('auth.login.submit.loading') : t('auth.login.submit.default')}
        </button>
      </form>
      
      {bottomSection}

    </div>
  );
};

export default Login;