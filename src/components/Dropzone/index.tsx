import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import { Container } from './styles';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState('');

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    setSelectedFileUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      {selectedFileUrl ? (
        <img src={selectedFileUrl} alt="Preview" />
      ) : (
        <p>
          <FiUpload />
          Imagem do estabelecimento
        </p>
      )}
    </Container>
  );
};
