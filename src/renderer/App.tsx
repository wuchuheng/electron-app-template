import { ConfigProvider, theme } from 'antd';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouteRender } from './config/Route';
import './styles/global.css';
import { MainLayout } from './layout/Maylayout';

// Check for system preference for dark mode
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initialize dark mode based on system preference
document.documentElement.classList.toggle('dark', prefersDarkMode);

// Wait for DOM to be ready before mounting React
document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);

  root.render(
    <React.StrictMode>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
          algorithm: prefersDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <MainLayout>
          <RouteRender />
        </MainLayout>
      </ConfigProvider>
    </React.StrictMode>
  );
});
