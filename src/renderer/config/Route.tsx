import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { Home } from '../pages/Home/Home';
import SettingsPage from '../pages/Settings/SettingPage';
import { UpdateDialog } from '../pages/Update/UpdateDialog';
import { AboutPage } from '../pages/About/AboutPage';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="about" element={<AboutPage />} />
    </Route>
    <Route path="/update-dialog" element={<UpdateDialog />} />
  </Routes>
);
