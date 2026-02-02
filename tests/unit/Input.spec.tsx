import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { Input } from '../../src/components/Input';

describe('Input component', () => {
  it('should be able to render an input', () => {
    const { getByPlaceholderText } = render(
      <Input name="email" type="email" placeholder="Email" />,
    );

    const input = getByPlaceholderText('Email');
    expect(input).toBeTruthy();

    const value = 'john@example.com';

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);

    expect(input).toHaveValue(value);
  });

  it('should be able to render an text input when type is not provided', () => {
    const { getByPlaceholderText } = render(
      <Input name="email" placeholder="Email" />,
    );

    const input = getByPlaceholderText('Email');
    expect(input).toBeTruthy();

    const value = 'john@example.com';

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);

    expect(input).toHaveValue(value);
  });
});
