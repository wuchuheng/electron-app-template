import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/renderer/layout/MainLayout';
import { Home } from '@/renderer/pages/Home/Home';
import { UpdateDialog } from '@/renderer/pages/Update/UpdateDialog';
import { AboutPage } from '@/renderer/pages/About/AboutPage';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<AboutPage />} />
    </Route>
    <Route path="/update-dialog" element={<UpdateDialog />} />
  </Routes>
);
