import React from 'react';
import ReactDOM from 'react-dom/client';

import 'flowbite';
import './styles/index.css';
import App from './App';
import DottingProvider from './context/DottingContext';
import DocumentProvider from './context/DocumentContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DottingProvider>
    <DocumentProvider>
      <App />
    </DocumentProvider>
  </DottingProvider>,
);
