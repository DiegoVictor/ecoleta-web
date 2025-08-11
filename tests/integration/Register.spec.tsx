import React, { PropsWithChildren } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { faker } from '@faker-js/faker';
import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-toastify';

import { Register } from '../../src/pages/Register';
import ibge from '../../src/services/ibge';
import api from '../../src/services/api';
import { DropzoneProps } from '../../src/components/Dropzone';

const mockUseMapEvent = jest.fn();
jest.mock('react-leaflet', () => {
  const Component = () => {
    return <div />;
  };

  return {
    MapContainer: ({ children }: PropsWithChildren) => {
      return <div data-testid="map-container">{children}</div>;
    },
    TileLayer: Component,
    Marker: Component,
    useMapEvent: (event: string, cb: (event: any) => void) => {
      return mockUseMapEvent(event, cb);
    },
  };
});

jest.mock('../../src/components/Dropzone', () => {
  return {
    Dropzone: ({ onFileSelected }: DropzoneProps) => {
      return (
        <input
          type="file"
          data-testid="dropzone"
          onChange={() => onFileSelected(new File([], ''))}
        />
      );
    },
  };
});

const mockUseNavigate = jest.fn();
jest.mock('react-router', () => {
  return {
    ...jest.requireActual('react-router'),
    useNavigate: () => mockUseNavigate(),
  };
});

const getCurrentPosition = jest.fn();
Object.defineProperty(global.navigator, 'geolocation', {
  value: { getCurrentPosition },
});

const ibgeMock = new MockAdapter(ibge);
const apiMock = new MockAdapter(api);

describe('Register page', () => {
  it('should be able to navigate to home page', async () => {
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(getByTestId('home'));

    expect(getByText('Home')).toBeInTheDocument();
  });

  it('should not be able to register new collect point with invalid data', async () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
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
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    ibgeMock.onGet('/estados').reply(500);

    const error = jest.spyOn(toast, 'error');

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(error).toHaveBeenCalledWith(
      'Opa! Alguma coisa deu errado ao tentar carregar a lista de estados, tente recarregar a pagina!',
    );
  });

  it('should not be able to load cities', async () => {
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    const uf = 'SP';

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(500);

    apiMock.onGet('/items').reply(200, []);

    const error = jest.spyOn(toast, 'error');

    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => getByText(uf));

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(error).toHaveBeenCalledWith(
      'Opa! Alguma coisa deu errado ao tentar carregar a lista de municípios, tente recarregar a pagina!',
    );
  });

  it('should not be able to load items', async () => {
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    apiMock.onGet('/items').reply(500);

    const error = jest.spyOn(toast, 'error');

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(error).toHaveBeenCalledWith(
      'Opa! Alguma coisa deu errado ao tentar carregar a lista de items para coleta, tente recarregar a pagina!',
    );
  });

  it('should be able to register new collection point', async () => {
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    jest.useFakeTimers();

    const uf = 'SP';
    const city = 'São Paulo';
    const item = {
      id: faker.number.int(),
      title: faker.lorem.word(),
      image_url: faker.image.url(),
    };

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(200, [{ nome: city }]);

    apiMock.onPost('/points').reply(200).onGet('/items').reply(200, [item]);

    const navigate = jest.fn();
    mockUseNavigate.mockReturnValue(navigate);

    const { getByText, getByTestId, getByLabelText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 0 });

    await waitFor(() => getByText(uf));

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await waitFor(() => getByText(city));

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
      fireEvent.click(getByTestId('map-container'));
    });

    fireEvent.change(getByTestId('dropzone'));

    fireEvent.change(getByLabelText('Nome da entidade'), {
      target: {
        value: faker.company.name(),
      },
    });
    fireEvent.change(getByLabelText('Email'), {
      target: {
        value: faker.internet.email(),
      },
    });
    fireEvent.change(getByLabelText('WhatsApp'), {
      target: {
        value: faker.phone.number(),
      },
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 1 });

    jest.runAllTimers();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('should not be able to register new collection point with network error', async () => {
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    jest.useFakeTimers();

    const uf = 'SP';
    const city = 'São Paulo';
    const item = {
      id: faker.number.int(),
      title: faker.lorem.word(),
      image_url: faker.image.url(),
    };

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(200, [{ nome: city }]);

    apiMock.onPost('/points').reply(500).onGet('/items').reply(200, [item]);

    const error = jest.spyOn(toast, 'error');

    const { getByText, getByTestId, getByLabelText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 0 });

    await waitFor(() => getByText(uf));

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await waitFor(() => getByText(city));

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
      fireEvent.click(getByTestId('map-container'));
    });

    fireEvent.change(getByTestId('dropzone'));

    fireEvent.change(getByLabelText('Nome da entidade'), {
      target: {
        value: faker.company.name(),
      },
    });
    fireEvent.change(getByLabelText('Email'), {
      target: {
        value: faker.internet.email(),
      },
    });
    fireEvent.change(getByLabelText('WhatsApp'), {
      target: {
        value: faker.phone.number(),
      },
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(getByTestId('overlay')).toHaveStyle({ opacity: 0 });
    expect(error).toHaveBeenCalledWith(
      'Opa! Alguma coisa deu errado, tente novamente mais tarde!',
    );
  });

  it('should be able to unselect an item', async () => {
    getCurrentPosition.mockImplementationOnce(cb => {
      cb({
        coords: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
    });

    const uf = 'SP';
    const city = 'São Paulo';
    const item = {
      id: faker.number.int(),
      title: faker.lorem.word(),
      image_url: faker.image.url(),
    };

    ibgeMock
      .onGet('/estados')
      .reply(200, [{ sigla: uf }])
      .onGet(`/estados/${uf}/municipios`)
      .reply(200, [{ nome: city }]);

    apiMock.onGet('/items').reply(200, [item]);

    const { getByText, getByTestId } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => getByText(uf));

    await act(async () => {
      fireEvent.change(getByTestId('state'), {
        target: {
          value: uf,
        },
      });
    });

    await waitFor(() => getByText(city));

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
