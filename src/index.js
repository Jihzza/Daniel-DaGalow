// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Make sure Tailwind CSS is imported here
// in src/index.js or App.js
import 'react-phone-input-2/lib/style.css';       // default styles
import './phone-input-overrides.css';              // your overrides
import { ServiceProvider } from "./components/contexts/ServiceContext";

// Add this to src/index.js or create a separate protection.js file
document.addEventListener('DOMContentLoaded', () => {
  // Prevent text selection
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.msUserSelect = 'none';

  // Prevent image dragging
  const images = document.getElementsByTagName('img');
  for (let img of images) {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // Prevent right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Optional: Prevent copying
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
  });
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServiceProvider>
      <App />
    </ServiceProvider>
  </React.StrictMode>
);

