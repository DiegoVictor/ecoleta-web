import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import { Container } from './styles';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected }) => {
  const [selected_file_url, setSelectedFileUrl] = useState('');

  const onDrop = useCallback(
    accepted_files => {
      const file = accepted_files[0];
      const file_url = URL.createObjectURL(file);

      setSelectedFileUrl(file_url);
      onFileSelected(file);
    },
    [onFileSelected],
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      {selected_file_url ? (
        <img src={selected_file_url} alt="Preview" />
      ) : (
        <p>
          <FiUpload />
          Imagem do estabelecimento
        </p>
      )}
    </Container>
  );
};

export default Dropzone;
