import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Debug: show raw URL parts

    // Parse token from query string or hash fragment
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = searchParams.get('access_token') || hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token') || searchParams.get('refresh_token');

    if (!access_token) {
      console.error('❌ No access_token found!');
      setError(t('auth.reset_password.errors.invalid_link'));
      return;
    }

    // Set full Supabase session
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(res => console.log('supabase.setSession OK →', res))
      .catch(err => {
        console.error('⚠️ supabase.setSession error:', err);
        setError(err.message || t('auth.reset_password.errors.default'));
      });
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError(t('auth.reset_password.errors.password_mismatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.reset_password.errors.password_length'));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage(t('auth.reset_password.success.message'));
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('⚠️ updateUser error:', err);
      setError(err.message || t('auth.reset_password.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 bg-gentleGray rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">
        {t('auth.reset_password.title')}
      </h2>

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
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            {t('auth.reset_password.password.label')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('auth.reset_password.password.placeholder')}
            className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-gentleGray focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
            {t('auth.reset_password.confirm_password.label')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t('auth.reset_password.confirm_password.placeholder')}
            className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-gentleGray focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-oxfordBlue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? t('auth.reset_password.submit.loading') : t('auth.reset_password.submit.default')}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
