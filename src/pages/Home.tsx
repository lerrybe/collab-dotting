import { Navigate } from 'react-router-dom';

export default function Home() {
  const randomId = Math.random().toString(36).substring(7);

  return <Navigate to={`/${randomId}`} />;
}
