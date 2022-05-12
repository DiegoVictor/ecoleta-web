import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import faker from '@faker-js/faker';

import DropZone from '../../src/components/Dropzone';

interface DataTransfer {
  dataTransfer: {
    files: File[];
    items: {
      kind: string;
      type: string;
      getAsFile(): File;
    }[];
    types: string[];
  };
}

const imageUrl = faker.image.imageUrl();
global.URL.createObjectURL = jest.fn(() => imageUrl);

describe('Upload', () => {
  function flushPromises(
    ui: JSX.Element,
    container: HTMLElement,
  ): Promise<HTMLElement> {
    return new Promise(resolve =>
      global.setImmediate(() => {
        render(ui, { container });
        resolve(container);
      }),
    );
  }

  async function dispatchEvt(
    node: HTMLDivElement,
    type: string,
    data: DataTransfer,
  ): Promise<void> {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, data);
    await act(async () => {
      fireEvent(node, event);
    });
  }

  function mockData(files: File[]): DataTransfer {
    return {
      dataTransfer: {
        files,
        items: files.map(file => ({
          kind: 'file',
          type: file.type,
          getAsFile: () => file,
        })),
        types: ['Files'],
      },
    };
  }

  it('should be able to show a message when dragging a file', async () => {
    const file = new File(['image'], 'ping.jpg', {
      type: 'image/jpeg',
    });
    const data = mockData([file]);
    const onUpload = jest.fn();

    const component = <DropZone onFileSelected={onUpload} />;
    const { container, getByText, getByAltText } = render(component);
    const dropzone = container.querySelector('div');

    expect(getByText('Imagem do estabelecimento')).toBeInTheDocument();

    if (dropzone) {
      await act(async () => {
        dispatchEvt(dropzone, 'drop', data);
      });
      await flushPromises(component, container);
    }

    expect(onUpload).toHaveBeenCalledWith(file);
    expect(getByAltText('Preview')).toHaveAttribute('src', imageUrl);
  });
});
