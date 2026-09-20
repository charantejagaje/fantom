import React from 'react';
import { createRoot } from 'react-dom/client';
import PlatformRoot from './platform';
import './index.css';

/**
 * Mounts the deployment platform UI when the URL carries ?app=platform.
 * The legacy app (friend's interface) stays the default at /.
 */
const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <PlatformRoot />
    </React.StrictMode>
  );
}
