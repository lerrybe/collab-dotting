import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home.tsx';
import Document from '../pages/Document.tsx';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/:docAddress' element={<Document />} />
      </Routes>
    </BrowserRouter>
  );
}
