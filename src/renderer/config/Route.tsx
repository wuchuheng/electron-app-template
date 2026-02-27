import { Route, Routes } from 'react-router-dom';
import React from 'react';
import { HomePage } from '../pages/Home/HomePage';
import { AboutPage } from '../pages/About/AboutPage';
import { UpdateDialog } from '../pages/Update/UpdateDialog';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/update-dialog" element={<UpdateDialog />} />
  </Routes>
);