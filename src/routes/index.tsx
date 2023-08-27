import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import Document from '../pages/Document';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/:docId' element={<Document />} />
      </Routes>
    </BrowserRouter>
  );
}
