import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home/Home';

export const RouteRender: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </HashRouter>
);
