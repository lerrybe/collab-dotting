import { Navigate } from 'react-router-dom';

export default function Home() {
  const randomAddress = Math.random().toString(36).substring(7);

  return <Navigate to={`/${randomAddress}`} />;
}
