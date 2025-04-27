// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Make sure Tailwind CSS is imported here
// in src/index.js or App.js
import 'react-phone-input-2/lib/style.css';       // default styles
import './phone-input-overrides.css';              // your overrides
import { ServiceProvider } from "./components/contexts/ServiceContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServiceProvider>
      <App />
    </ServiceProvider>
  </React.StrictMode>
);
