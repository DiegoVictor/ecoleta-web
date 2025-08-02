import React from 'react';
import { Route, BrowserRouter } from 'react-router';

import Home from '../pages/Home';
import Register from '../pages/Register';

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={Register} path="/register" />
    </BrowserRouter>
  );
};

export default Routes;
