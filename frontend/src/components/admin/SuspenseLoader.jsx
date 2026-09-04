/**
 * components/admin/SuspenseLoader.jsx
 *
 * Renders a full Shinobi Shuriken Loading sequence for Admin lazy page chunks.
 */

import React from 'react';
import ShinobiLoader from '@/components/ui/ShinobiLoader';

export default function SuspenseLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <ShinobiLoader text="CALIBRATING ADMIN TELEMETRY // LOADING MODULE..." />
    </div>
  );
}
