import { useParams } from 'react-router-dom';

const Document = () => {
  const { docAddress } = useParams();

  if (!docAddress) {
    return null;
  }

  return <>DocumentPage</>;
};

export default Document;
