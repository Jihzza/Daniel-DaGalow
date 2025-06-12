import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ForgotPassword from '../components/Auth/ForgotPassword';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main
      className="absolute left-0 right-0 flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray"
      style={{
        top: 'var(--header-height, 56px)',
        bottom: 'var(--navbar-height, 48px)',
      }}
    >
      <div className="w-[90%] max-w-md bg-gentleGray p-8 rounded-lg shadow-lg">
        <ForgotPassword
          isModal={false}
          onSuccess={() => {
            // The component shows a success message.
            // You can add a timed redirect here if desired, e.g.:
            // setTimeout(() => navigate('/login'), 5000);
          }}
          onBackToLogin={() => navigate('/login')}
        />
      </div>
    </main>
  );
};

export default ForgotPasswordPage;