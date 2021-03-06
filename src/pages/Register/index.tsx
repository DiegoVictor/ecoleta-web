import React, {
  useEffect,
  useState,
  ChangeEvent,
  useRef,
  useCallback,
} from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { useHistory } from 'react-router-dom';
import { LeafletMouseEvent } from 'leaflet';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';

import api from '../../services/api';
import ibge from '../../services/ibge';
import Check from '../../assets/check.svg';
import Logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';
import Input from '../../components/Input';
import Select from '../../components/Select';
import {
  Container,
  Link,
  Form,
  FieldGroup,
  Field,
  MapContainer,
  Items,
  Item,
  Overlay,
} from './styles';

interface Point {
  name: string;
  email: string;
  whatsapp: string;
  uf: string;
  city: string;
}

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  sigla: string;
}

interface City {
  nome: string;
}

interface ValidationErrors {
  [key: string]: any;
}

const Register: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [selectedFile, setSelectedFile] = useState<File>();
  const [showOverlay, setShowOverlay] = useState(false);

  const history = useHistory();
  const formRef = useRef<FormHandles>(null);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const handleSelectedUf = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const uf = event.target.value;

      (async () => {
        try {
          const { data } = await ibge.get<City[]>(`/estados/${uf}/municipios`);
          setCities(data.map(city => city.nome));
        } catch (err) {
          toast.error(
            'Opa! Alguma coisa deu errado ao tentar carregar a lista de municípios, tente recarregar a pagina!',
          );
        }
      })();
    },
    [],
  );

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    setPosition([event.latlng.lat, event.latlng.lng]);
  }, []);

  const handleSelectItem = useCallback(
    (id: number) => {
      if (selectedItems.includes(id)) {
        const filteredItems = selectedItems.filter(item => item !== id);
        setSelectedItems(filteredItems);
      } else {
        setSelectedItems([...selectedItems, id]);
      }
    },
    [selectedItems, setSelectedItems],
  );

  const handleSubmit = useCallback(
    async ({ name, email, whatsapp, uf, city }: Point) => {
      try {
        const [latitude, longitude] = position;
        const point = {
          name,
          email,
          whatsapp,
          uf,
          city,
          latitude,
          longitude,
          items: selectedItems,
          image: selectedFile,
        };

        const schema = Yup.object().shape({
          name: Yup.string()
            .min(3, 'Digite pelo menos 3 caracteres')
            .required('O nome da entidade é obrigatório'),
          email: Yup.string()
            .email('Digite um email válido')
            .required('O email é obrigatório'),
          whatsapp: Yup.string().required('O WhatsApp é obrigatório'),
          uf: Yup.string()
            .length(2, 'Digite apenas a UF do estado')
            .required('O estado é obrigatório'),
          city: Yup.string().required('A cidade é obrigatória'),
          latitude: Yup.number().notOneOf([0]).required(),
          longitude: Yup.number().notOneOf([0]).required(),
          items: Yup.array().required('Escolha pelo menos uma categoria'),
          image: Yup.mixed().required(
            'Escolha uma imagem para o estabelecimento',
          ),
        });

        await schema.validate(point, { abortEarly: false });

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', selectedItems.join(','));

        // @ts-ignore: Validation will prevent that this file not exists
        data.append('image', selectedFile);

        await api.post('/points', data);

        setShowOverlay(true);
        setTimeout(() => {
          history.push('/');
        }, 2000);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors: ValidationErrors = {};

          err.inner.forEach(error => {
            errors[error.path] = error.message;
          });

          setValidationErrors(errors);
          formRef.current?.setErrors(errors);
        } else {
          toast.error(
            'Opa! Alguma coisa deu errado, tente novamente mais tarde!',
          );
        }
      }
    },
    [position, selectedItems, selectedFile],
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/items');
        setItems(data);
      } catch (err) {
        toast.error(
          'Opa! Alguma coisa deu errado ao tentar carregar a lista de items para coleta, tente recarregar a pagina!',
        );
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ibge.get<UF[]>('/estados');

        setUfs(data.map(uf => uf.sigla).sort());
      } catch (err) {
        toast.error(
          'Opa! Alguma coisa deu errado ao tentar carregar a lista de estados, tente recarregar a pagina!',
        );
      }
    })();
  }, []);

  return (
    <>
      <Container>
        <header>
          <img src={Logo} alt="Ecoleta" />

          <Link to="/" data-testid="home">
            <FiArrowLeft />
            Voltar para Home
          </Link>
        </header>

        <Form ref={formRef} onSubmit={handleSubmit}>
          <h1>
            Cadastro do
            <br /> ponto de coleta
          </h1>

          <Dropzone onFileSelected={setSelectedFile} />
          {validationErrors.image && <span>{validationErrors.image}</span>}

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <Field>
              <label htmlFor="name">Nome da entidade</label>
              <Input type="text" name="name" id="name" />
            </Field>

            <FieldGroup>
              <Field>
                <label htmlFor="email">Email</label>
                <Input type="email" name="email" id="email" />
              </Field>
              <Field>
                <label htmlFor="whatsapp">WhatsApp</label>
                <Input type="text" name="whatsapp" id="whatsapp" />
              </Field>
            </FieldGroup>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            <MapContainer>
              <Map center={position} zoom={15} onClick={handleMapClick}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {position && <Marker position={position} />}
              </Map>
            </MapContainer>
            {(validationErrors.latitude || validationErrors.longitude) && (
              <span>Escolha uma localização válida</span>
            )}

            <FieldGroup>
              <Field>
                <label htmlFor="uf">UF</label>
                <Select
                  name="uf"
                  id="uf"
                  onChange={handleSelectedUf}
                  data-testid="state"
                >
                  <option value="" disabled>
                    Selecione um estado
                  </option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <label htmlFor="city">Cidade</label>
                <Select name="city" id="city" data-testid="city">
                  <option value="">Selecione uma cidade</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGroup>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>

            <Items>
              {items.map(item => (
                <Item
                  key={item.id.toString()}
                  onClick={() => handleSelectItem(item.id)}
                  selected={selectedItems.includes(item.id)}
                  data-testid={`item_${item.id}`}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </Item>
              ))}
            </Items>
            {validationErrors.items && <span>{validationErrors.items}</span>}
          </fieldset>

          <button type="submit" data-testid="submit">
            Cadastrar ponto de coleta
          </button>
        </Form>
      </Container>
      <Overlay data-testid="overlay" show={showOverlay}>
        <img src={Check} alt="Success" />
        <span>Cadastro concluído!</span>
      </Overlay>
    </>
  );
};

export default Register;
