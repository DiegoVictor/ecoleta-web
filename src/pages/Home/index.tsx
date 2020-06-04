import React from 'react';
import { FiLogIn } from 'react-icons/fi';

import Logo from '../../assets/logo.svg';
import { Container, Main, Link } from './styles';
import Layout from '../../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <Container>
        <div>
          <header>
            <img src={Logo} alt="Ecoleta" />
          </header>

          <Main>
            <h1>Seu marketplace de coleta de resíduos.</h1>
            <p>
              Ajudamos pessoas a encontrarem pontos de coleta de forma
              eficiente.
            </p>

            <Link to="/register">
              <span>
                <FiLogIn />
              </span>
              <strong>Cadastrar um ponto de coleta</strong>
            </Link>
          </Main>
        </div>
      </Container>
    </Layout>
  );
};

export default Home;
