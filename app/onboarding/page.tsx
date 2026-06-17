'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Zap } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <ModulePage 
      title="Rapid Onboarding" 
      subtitle="Initialize new client nodes in seconds with automated contract generation." 
      icon={Zap}
    >
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <Zap size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
        <p>Automated contract generation and rapid client onboarding sequences are pending deployment.</p>
        <p>This module will be online soon.</p>
      </div>
    </ModulePage>
  );
}
