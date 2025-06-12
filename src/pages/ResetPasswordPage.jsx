import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// --- Helper Icon Components ---
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


const ResetPasswordPage = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!user) {
      setError("You must be logged in to reset your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset_password.errors.password_mismatch', 'Passwords do not match.'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.reset_password.errors.password_length', 'Password should be at least 6 characters.'));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Your password has been updated successfully.");
      setTimeout(() => navigate('/settings'), 3000); // Redirect back to settings page
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="absolute left-0 right-0 flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray"
      style={{
        top: 'var(--header-height, 56px)',
        bottom: 'var(--navbar-height, 48px)',
      }}
    >
      <div className="w-[90%] max-w-md bg-gentleGray p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">
          {t('auth.reset_password.title', 'Reset Password')}
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

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                  {t('auth.reset_password.password.label', 'New Password')}
                </label>
                <div className="relative w-full">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.reset_password.password.placeholder', 'Enter new password')}
                    className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
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
                  {t('auth.reset_password.confirm_password.label', 'Confirm New Password')}
                </label>
                <div className="relative w-full">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder={t('auth.reset_password.confirm_password.placeholder', 'Confirm new password')}
                    className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
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
                className="w-full bg-oxfordBlue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? t('auth.reset_password.submit.loading', 'Updating...') : t('auth.reset_password.submit.default', 'Update Password')}
              </button>
          </form>
        )}
        <button
            onClick={() => navigate('/settings')}
            className="w-full text-center text-sm text-oxfordBlue mt-4 hover:underline"
        >
            Back to Settings
        </button>
      </div>
    </main>
  );
};

export default ResetPasswordPage;