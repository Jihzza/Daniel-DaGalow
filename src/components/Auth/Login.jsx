// components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Login = ({ isModal = false, onSuccess = () => {}, onForgotPassword = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('auth.login.password.placeholder')}
            className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
          />
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