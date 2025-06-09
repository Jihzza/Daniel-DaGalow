import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';
import Login from '../components/Auth/Login';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
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
        <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">{t('auth.login.title')}</h2>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center py-2 mb-4 border border-oxfordBlue rounded-lg text-oxfordBlue hover:bg-oxfordBlue/10 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          Continue with Google
        </button>
        
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
            <p className="text-center font-semibold mx-4 mb-0 text-gray-500">OR</p>
        </div>

        <Login
          isModal={false}
          onSuccess={() => navigate('/')}
          onForgotPassword={() => navigate('/forgot-password')}
        />
      </div>
    </main>
  );
};

export default LoginPage;