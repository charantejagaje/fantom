import React from 'react';
import { createRoot } from 'react-dom/client';
import PlatformApp from './platform';
import './index.css';

/**
 * Worker PWA entry. Same authenticated, RBAC-driven app - workers get the
 * mobile-first UI by role. Separated only so the manifest/SW wiring and
 * viewport stay worker-optimized.
 */
const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <PlatformApp />
    </React.StrictMode>,
  );
}
