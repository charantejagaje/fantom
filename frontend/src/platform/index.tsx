import React from 'react';
import { PlatformApp } from './PlatformApp';

/**
 * Platform entry. Mounted from src/platformLoader.tsx when the URL carries
 * ?app=platform (keeps the legacy experience untouched at the default URL).
 */
export default function PlatformRoot() {
  return <PlatformApp />;
}
