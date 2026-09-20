import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, ErrorBox, Loading } from '../ui';

/**
 * TEAM FEATURE (friend's extension point)
 * The backend declares its capabilities at /api/v1/friend-feature/capabilities.
 * The friend implements their feature and the UI picks it up automatically;
 * nothing here fakes functionality.
 *
 * Feature UI files live in: frontend/src/features/friend-feature/
 */
export const TeamFeatureSection: React.FC = () => {
  const [caps, setCaps] = useState<any>(null);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    api.friendCapabilities().then(setCaps).catch(setErr);
  }, []);

  if (err) return <ErrorBox error={err} />;
  if (!caps) return <Loading what="team feature capabilities" />;

  return (
    <div className="space-y-4">
      <Card title="Team Feature">
        <p className="text-xs text-slate-600 font-sans leading-relaxed">
          This section is reserved for the team extension feature. It reads the feature's capability
          endpoint and will render the implemented capabilities as they are added.
        </p>
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600">
          <div>implemented: {String(caps.implemented)}</div>
          <div>capabilities: {caps.capabilities.length ? caps.capabilities.join(', ') : 'none declared yet'}</div>
        </div>
        <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">{caps.notes}</p>
      </Card>
    </div>
  );
};
