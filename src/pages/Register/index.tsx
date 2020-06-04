import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { useHistory } from 'react-router-dom';
import { LeafletMouseEvent } from 'leaflet';
import * as Yup from 'yup';

import api from '../../services/api';
import Logo from '../../assets/logo.svg';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { toast } from 'react-toastify';
import ibge from '../../services/ibge';
import { FormHandles } from '@unform/core';
import {
  Container,
  Link,
  Form,
  FieldGroup,
  Field,
  MapContainer,
  Items,
  Item,
} from './styles';
import Layout from '../../components/Layout';

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
  name?: string;
  email?: string;
  whatsapp?: string;
  uf?: string;
  city?: string;
}

const Register: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const history = useHistory();
  const form_ref = useRef<FormHandles>(null);

  const [selected_items, setSelectedItems] = useState<number[]>([]);
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;

    if (uf.length > 0) {
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
    }
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setPosition([event.latlng.lat, event.latlng.lng]);
  };

  const handleSelectItem = (id: number) => {
    if (selected_items.includes(id)) {
      const filtered_items = selected_items.filter(item => item !== id);
      setSelectedItems(filtered_items);
    } else {
      setSelectedItems([...selected_items, id]);
    }
  };

  const handleSubmit = async ({ name, email, whatsapp, uf, city }: Point) => {
    try {
      const [latitude, longitude] = position;
      const items = selected_items.join(',');
      const point = {
        name,
        email,
        whatsapp,
        uf,
        city,
        latitude,
        longitude,
        items,
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
      });

      await schema.validate(point, { abortEarly: false });

      await api.post('/points', point);

      history.push('/');
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validation_errors: ValidationErrors = {};

        err.inner.forEach(error => {
          // validation_errors[error.path] = error.message;
        });

        if (form_ref.current) {
          form_ref.current.setErrors(validation_errors);
        }
      } else {
        toast.error(
          'Opa! Alguma coisa deu errado, tente novamente mais tarde!',
        );
      }
    }
  };

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
    <Layout>
      <Container>
        <header>
          <img src={Logo} alt="Ecoleta" />

          <Link to="/">
            <FiArrowLeft />
            Voltar para Home
          </Link>
        </header>

        <Form ref={form_ref} onSubmit={handleSubmit}>
          <h1>
            Cadastro do
            <br /> ponto de coleta
          </h1>

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

            <FieldGroup>
              <Field>
                <label htmlFor="uf">UF</label>
                <Select name="uf" id="uf" onChange={handleSelectUf}>
                  <option value="">Selecione um estado</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <label htmlFor="city">Cidade</label>
                <Select name="city" id="city">
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
                  selected={selected_items.includes(item.id)}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </Item>
              ))}
            </Items>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </Form>
      </Container>
    </Layout>
  );
};

export default Register;
