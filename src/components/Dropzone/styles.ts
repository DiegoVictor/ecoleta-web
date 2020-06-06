import styled from 'styled-components';

export const Container = styled.div`
  align-items: center;
  background: #e1faec;
  border-radius: 10px;
  display: flex;
  height: 300px;
  justify-content: center;
  margin-top: 48px;
  outline: 0;

  & + span {
    color: red;
    display: block;
    margin-top: 5px;
  }

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  p {
    align-items: center;
    border: 1px dashed #4ecb79;
    border-radius: 10px;
    color: #333;
    display: flex;
    flex-direction: column;
    height: calc(100% - 60px);
    justify-content: center;
    width: calc(100% - 60px);

    svg {
      color: #4ecb79;
      height: 24px;
      margin-bottom: 8px;
      width: 24px;
    }
  }
`;
