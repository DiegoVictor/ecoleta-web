import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const root =
  document.getElementById('root') ??
  (() => {
    const e = document.createElement('div');
    document.body.append(e);

    return e;
  })();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
