import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Home } from '../../src/pages/Home';

describe('Home page', () => {
  it('should be able to navigate to register page', async () => {
    const { getByTestId, getByText } = render(
      <BrowserRouter>
        <Routes>
          <Route element={<Home />} index />
          <Route path="/register" element={<div>Register</div>} />
        </Routes>
      </BrowserRouter>,
    );

    fireEvent.click(getByTestId('register'));

    expect(getByText('Register')).toBeInTheDocument();
  });
});
