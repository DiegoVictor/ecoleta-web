import React from 'react';
import { act, fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import faker from 'faker';
import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-toastify';

import Register from '../../src/pages/Register';
import ibge from '../../src/services/ibge';
import api from '../../src/services/api';

const mockGeolocation = {
  getCurrentPosition: jest.fn(success => {
    success({
      coords: {
        latitude: 0,
        longitude: 0,
      },
    });
  }),
};

// @ts-ignore
global.navigator.geolocation = mockGeolocation;

jest.mock('react-leaflet', () => {
  return {
    Map: ({
      onClick,
    }: {
      onClick: (event: { latlng: { lat: string; lng: string } }) => void;
    }) => {
      return (
        <div
          onClick={() => {
            const event = {
              latlng: {
                lat: faker.address.latitude(),
                lng: faker.address.longitude(),
              },
            };
            onClick(event);
          }}
          data-testid="map"
        ></div>
      );
    },
    TileLayer: () => {
      return <div />;
    },
    Marker: () => {
      return <div />;
    },
  };
});

jest.mock('../../src/components/Dropzone', () => {
  return {
    __esModule: true,
    default: ({ onFileSelected }: { onFileSelected: (file: File) => void }) => {
      return (
        <input
          type="file"
          onChange={function () {
            onFileSelected(new File(['file'], 'image.jpg'));
          }}
          data-testid="dropzone"
        />
      );
    },
  };
});

describe('Register page', () => {
  const ibgeMock = new MockAdapter(ibge);
  const apiMock = new MockAdapter(api);

  it('should be able to navigate to home page', async () => {
    const history = createBrowserHistory();
    const { getByTestId } = render(
      <Router history={history}>
        <Register />
      </Router>,
    );

    fireEvent.click(getByTestId('home'));

    expect(history.location.pathname).toBe('/');
  });

  it('should not be able to register new collect point with invalid data', async () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    [
      'O nome da entidade é obrigatório',
      'O email é obrigatório',
      'O WhatsApp é obrigatório',
      'O estado é obrigatório',
      'A cidade é obrigatória',
      'Escolha uma localização válida',
      'Escolha pelo menos uma categoria',
      'Escolha uma imagem para o estabelecimento',
    ].forEach(message => {
      expect(getByText(message)).toBeInTheDocument();
    });
  });

  it('should not be able to load states', async () => {
    ibgeMock.onGet('/estados').reply(500);

    const error = jest.spyOn(toast, 'error');

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await wait(() =>
      expect(error).toHaveBeenCalledWith(
        'Opa! Alguma coisa deu errado ao tentar carregar a lista de estados, tente recarregar a pagina!',
      ),
    );
  });

  it('should not be able to load cities', async () => {
    const uf = faker.address.stateAbbr();

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(500);

    apiMock.onGet('/items').reply(200, []);

    const error = jest.spyOn(toast, 'error');

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await wait(() => {
      expect(getByText(uf)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await wait(() =>
      expect(error).toHaveBeenCalledWith(
        'Opa! Alguma coisa deu errado ao tentar carregar a lista de municípios, tente recarregar a pagina!',
      ),
    );
  });

  it('should not be able to load items', async () => {
    apiMock.onGet('/items').reply(500);

    const error = jest.spyOn(toast, 'error');

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await wait(() =>
      expect(error).toHaveBeenCalledWith(
        'Opa! Alguma coisa deu errado ao tentar carregar a lista de items para coleta, tente recarregar a pagina!',
      ),
    );
  });

  it('should be able to register new collection point', async () => {
    jest.useFakeTimers();

    const uf = faker.address.stateAbbr();
    const city = faker.address.city();
    const item = {
      id: faker.random.number(),
      title: faker.random.word(),
      image_url: faker.image.imageUrl(),
    };

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(200, [{ nome: city }]);

    apiMock.onPost('/points').reply(200).onGet('/items').reply(200, [item]);

    const history = createBrowserHistory();
    history.location.pathname = '/register';

    const { getByText, getByTestId, getByLabelText } = render(
      <Router history={history}>
        <Register />
      </Router>,
    );

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 0 });

    await wait(() => {
      expect(getByText(uf)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await wait(() => {
      expect(getByText(city)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(getByTestId('city'), {
        target: {
          value: city,
        },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId(`item_${item.id}`));
    });

    await act(async () => {
      fireEvent.click(getByTestId('map'));
    });

    fireEvent.change(getByTestId('dropzone'));

    fireEvent.change(getByLabelText('Nome da entidade'), {
      target: {
        value: faker.name.findName(),
      },
    });
    fireEvent.change(getByLabelText('Email'), {
      target: {
        value: faker.internet.email(),
      },
    });
    fireEvent.change(getByLabelText('WhatsApp'), {
      target: {
        value: faker.name.findName(),
      },
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 1 });

    jest.runAllTimers();

    expect(history.location.pathname).toBe('/');
  });

  it('should not be able to register new collection point with network error', async () => {
    jest.useFakeTimers();

    const uf = faker.address.stateAbbr();
    const city = faker.address.city();
    const item = {
      id: faker.random.number(),
      title: faker.random.word(),
      image_url: faker.image.imageUrl(),
    };

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(200, [{ nome: city }]);

    apiMock.onPost('/points').reply(500).onGet('/items').reply(200, [item]);

    const error = jest.spyOn(toast, 'error');

    const history = createBrowserHistory();
    history.location.pathname = '/register';

    const { getByText, getByTestId, getByLabelText } = render(
      <Router history={history}>
        <Register />
      </Router>,
    );

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 0 });

    await wait(() => {
      expect(getByText(uf)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await wait(() => {
      expect(getByText(city)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(getByTestId('city'), {
        target: {
          value: city,
        },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId(`item_${item.id}`));
    });

    await act(async () => {
      fireEvent.click(getByTestId('map'));
    });

    fireEvent.change(getByTestId('dropzone'));

    fireEvent.change(getByLabelText('Nome da entidade'), {
      target: {
        value: faker.name.findName(),
      },
    });
    fireEvent.change(getByLabelText('Email'), {
      target: {
        value: faker.internet.email(),
      },
    });
    fireEvent.change(getByLabelText('WhatsApp'), {
      target: {
        value: faker.name.findName(),
      },
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 0 });
    expect(history.location.pathname).toBe('/register');
    expect(error).toHaveBeenCalledWith(
      'Opa! Alguma coisa deu errado, tente novamente mais tarde!',
    );
  });

  it('should be to unselect an item', async () => {
    const uf = faker.address.stateAbbr();
    const city = faker.address.city();
    const item = {
      id: faker.random.number(),
      title: faker.random.word(),
      image_url: faker.image.imageUrl(),
    };

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(200, [{ nome: city }]);

    apiMock.onGet('/items').reply(200, [item]);

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await wait(() => {
      expect(getByText(uf)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await wait(() => {
      expect(getByText(city)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(getByTestId(`item_${item.id}`));
    });

    expect(getByTestId(`item_${item.id}`)).toHaveStyle({
      background: '#e1faec',
      border: '2px solid #34cb79',
    });

    await act(async () => {
      fireEvent.click(getByTestId(`item_${item.id}`));
    });

    expect(getByTestId(`item_${item.id}`)).not.toHaveStyle({
      background: '#e1faec',
      border: '2px solid #34cb79',
    });
  });
});
