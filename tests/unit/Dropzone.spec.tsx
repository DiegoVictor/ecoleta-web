import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import { Dropzone } from '../../src/components/Dropzone';

const mockUseDropzone = jest.fn();
jest.mock('react-dropzone', () => {
  return {
    useDropzone: (params: Record<string, any>) => mockUseDropzone(params),
  };
});

const imageUrl = faker.image.url();
global.URL.createObjectURL = jest.fn(() => imageUrl);

describe('Upload', () => {
  it('should be able to show a message when dragging a file', async () => {
    const file = new File(['image'], 'ping.jpg', {
      type: 'image/jpeg',
    });
    const data = {
      dataTransfer: {
        files: [file],
        items: [file].map(f => ({
          kind: 'file',
          type: f.type,
          getAsFile: () => f,
        })),
        types: ['Files'],
      },
    };
    const onUpload = jest.fn();

    mockUseDropzone.mockImplementation(({ onDrop }) => {
      return {
        getRootProps: () => ({
          onDragEnter: () => {
            onDrop([file]);
          },
        }),
        getInputProps: jest.fn(),
      };
    });

    const { container, getByText, getByAltText } = render(
      <Dropzone onFileSelected={onUpload} />,
    );

    expect(getByText('Imagem do estabelecimento')).toBeInTheDocument();
    expect(mockUseDropzone).toHaveBeenCalledWith({
      onDrop: expect.any(Function),
      accept: { 'image/*': [] },
    });

    const dropzone = container.querySelector('div');
    if (!dropzone) {
      throw new Error('Dropzone not found');
    }

    await act(() => fireEvent.dragEnter(dropzone, data));

    expect(onUpload).toHaveBeenCalledWith(file);
    expect(getByAltText('Preview')).toHaveAttribute('src', imageUrl);
  });
});
