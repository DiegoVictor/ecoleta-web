import React, { ChangeEvent, PropsWithChildren } from 'react';

interface SelectProps extends PropsWithChildren {
  name: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  name,
  children,
  error,
  ...rest
}) => {
  return (
    <>
      <select name={name} {...rest}>
        {children}
      </select>
      {error && <span>{error}</span>}
    </>
  );
};
