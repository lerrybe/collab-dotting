import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import Document from '../pages/Document';
import { PUBLIC_URL } from '../constant/urls';

export default function Routing() {
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/:docId' element={<Document />} />
      </Routes>
    </BrowserRouter>
  );
}
