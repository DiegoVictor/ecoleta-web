import React from 'react';
import { ToastContainer } from 'react-toastify';

import Routes from './routes';
import Theme from './styles/theme';

const App: React.FC = () => {
  return (
    <>
      <Theme />
      <ToastContainer />
      <Routes />
    </>
  );
};

export default App;
