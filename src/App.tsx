import React from 'react';
import { ToastContainer } from 'react-toastify';

import { AppRoutes } from './routes';
import Theme from './styles/theme';

const App: React.FC = () => {
  return (
    <>
      <Theme />
      <ToastContainer />
      <AppRoutes />
    </>
  );
};

export default App;
