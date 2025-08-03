import React from 'react';

interface InputProps {
  name: string;
  id?: string;
  type?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  name,
  type = 'text',
  error,
  ...rest
}) => {
  return (
    <>
      <input name={name} type={type} {...rest} />
      {error && <span>{error}</span>}
    </>
  );
};
