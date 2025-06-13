import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'react-phone-input-2/lib/style.css';
import './phone-input-overrides.css';
import './i18n'; // Import the i18n configuration
import { ServiceProvider } from "./contexts/ServiceContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServiceProvider>
      <App />
    </ServiceProvider>
  </React.StrictMode>
);