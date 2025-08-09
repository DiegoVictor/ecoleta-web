import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { Home } from '../../src/pages/Home';

describe('Home page', () => {
  it('should be able to navigate to register page', async () => {
    const history = createBrowserHistory();
    const { getByTestId } = render(
      <Router history={history}>
        <Home />
      </Router>,
    );

    fireEvent.click(getByTestId('register'));

    expect(history.location.pathname).toBe('/register');
  });
});
