import React from 'react';
import { ToastContainer } from 'react-toastify';

import Theme from '../../styles/theme';

const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Theme />
      <ToastContainer />
      {children}
    </>
  );
};

export default Layout;
