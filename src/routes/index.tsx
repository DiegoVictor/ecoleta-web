import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router';

import Home from '../pages/Home';
import Register from '../pages/Register';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Home />} index />
        <Route element={<Register />} path="/register" />
      </Routes>
    </BrowserRouter>
  );
};
