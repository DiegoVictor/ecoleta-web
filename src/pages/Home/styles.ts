import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

import background from '../../assets/home-background.svg';

export const Container = styled.div`
  background: url(${background}) no-repeat 800px bottom;
  height: 100vh;

  > div {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0px auto;
    max-width: 1100px;
    padding: 0px 30px;
    width: 100%;

    @media (max-width: 900px) {
      align-items: center;
      text-align: center;
    }

    header {
      margin: 48px 0px 0px;

      @media (max-width: 900px) {
        margin: 48px auto 0px;
      }
    }
  }
`;

export const Main = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  max-width: 560px;

  @media (max-width: 900px) {
    align-items: center;
  }

  h1 {
    color: var(--title-color);
    font-size: 54px;

    @media (max-width: 900px) {
      font-size: 42px;
    }
  }

  p {
    font-size: 24px;
    line-height: 38px;
    margin-top: 24px;

    @media (max-width: 900px) {
      font-size: 24px;
    }
  }
`;

export const Link = styled(RouterLink)`
  align-items: center;
  background: var(--primary-color);
  border-radius: 8px;
  display: flex;
  height: 72px;
  margin-top: 40px;
  max-width: 360px;
  overflow: hidden;
  text-decoration: none;
  width: 100%;

  &:hover {
    background: #2fb86e;
  }

  span {
    align-items: center;
    background: rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: center;
    height: 72px;
    transition: background-color 0.2s;
    width: 72px;

    svg {
      color: #fff;
      height: 20px;
      width: 20px;
    }
  }

  strong {
    flex: 1;
    text-align: center;
    color: #fff;
  }
`;
