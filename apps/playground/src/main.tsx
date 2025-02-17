import React from 'react';
import ReactDOM from 'react-dom/client';

import { i18n } from '@open-data-capture/i18next';

import { App } from './App';

import '@open-data-capture/react-core/styles.css';

await i18n.initialize();

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
