import React, { useEffect, useRef, ChangeEvent } from 'react';
import { useField } from '@unform/core';

interface SelectProps {
  name: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
}

const Select: React.FC<SelectProps> = ({ name, children, ...rest }) => {
  const inputRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  return (
    <>
      <select ref={inputRef} defaultValue={defaultValue} {...rest}>
        {children}
      </select>
      {error && <span>{error}</span>}
    </>
  );
};

export default Select;
