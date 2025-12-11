import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Application Entry Point
 * 
 * @remarks
 * This is what mounts the React application to the DOM.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);