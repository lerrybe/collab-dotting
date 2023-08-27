import React from 'react';
import ReactDOM from 'react-dom/client';

import 'flowbite';
import './styles/index.css';
import App from './App';
import DottingProvider from './context/DottingContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DottingProvider>
      <App />
    </DottingProvider>
  </React.StrictMode>,
);
