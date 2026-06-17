'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Globe } from 'lucide-react';

export default function GlobalDeliveryPage() {
  return (
    <ModulePage 
      title="Global Delivery" 
      subtitle="Scale your agency footprint across any border with localized AI nodes." 
      icon={Globe}
    >
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <Globe size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
        <p>Global Delivery routing and localized nodes are currently initializing.</p>
        <p>This module will be online soon.</p>
      </div>
    </ModulePage>
  );
}
