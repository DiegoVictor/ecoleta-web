import styled, { css } from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Form as Unform } from '@unform/web';

export const Container = styled.div`
  margin: 0px auto;
  max-width: 1100px;
  width: 100%;

  header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 48px;
  }
`;

export const Link = styled(RouterLink)`
  align-items: center;
  color: var(--title-color);
  display: flex;
  font-weight: bold;
  text-decoration: none;

  svg {
    color: var(--primary-color);
    margin-right: 16px;
  }
`;

export const Form = styled(Unform)`
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin: 80px auto;
  max-width: 730px;
  padding: 64px;

  h1 {
    font-size: 36px;
  }

  fieldset {
    border: 0px;
    margin-top: 64px;
    min-inline-size: auto;
  }

  legend {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    width: 100%;

    h2 {
      font-size: 24px;
    }

    span {
      color: var(--text-color);
      font-size: 14px;
      font-weight: normal;
    }
  }

  button {
    align-self: flex-end;
    background: var(--primary-color);
    border: 0;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    height: 56px;
    margin-top: 40px;
    transition: background-color 0.2s;
    width: 260px;

    &:hover {
      background: #2fb86e;
    }
  }
`;

export const Field = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: 24px;

  input[type='text'],
  input[type='email'],
  input[type='number'] {
    background: #f0f0f5;
    border: 0;
    border-radius: 8px;
    color: #6c6c80;
    flex: 1;
    font-size: 16px;
    padding: 16px 24px;

    &::placeholder {
      color: #a0a0b2;
    }
  }

  input + span,
  select + span {
    color: red;
    display: block;
    margin-top: 6px;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: #f0f0f5;
    border: 0;
    border-radius: 8px;
    color: #6c6c80;
    flex: 1;
    font-size: 16px;
    padding: 16px 24px;
  }

  label {
    font-size: 14px;
    margin-bottom: 8px;
  }

  :disabled {
    cursor: not-allowed;
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex: 1;

  ${Field} + ${Field} {
    margin-left: 24px;
  }
`;

export const Items = styled.ul`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
  list-style: none;

  & + span {
    color: red;
    display: block;
    margin-top: 10px;
  }
`;

interface ItemProps {
  selected: boolean;
}

export const Item = styled.li<ItemProps>`
  align-items: center;
  background: #f5f5f5;
  border: 2px solid #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
  padding: 32px 24px 16px;
  text-align: center;

  ${props =>
    props.selected &&
    css`
      background: #e1faec;
      border: 2px solid #34cb79;
    `}

  span {
    align-items: center;
    color: var(--title-color);
    display: flex;
    flex: 1;
    margin-top: 12px;
  }
`;

export const MapContainer = styled.div`
  > div {
    border-radius: 8px;
    height: 350px;
    margin-bottom: 5px;
    width: 100%;
  }

  & + span {
    color: red;
    display: block;
    margin-bottom: 24px;
  }

  & + ${FieldGroup} {
    margin-top: 24px;
  }
`;
