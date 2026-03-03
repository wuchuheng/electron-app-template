// eslint-disable-next-line import/no-unresolved
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './config/Route';
import './styles/global.css';
import './i18n/i18n';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);

root.render(
  <React.StrictMode>
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  </React.StrictMode>
);
