'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { CheckCircle } from 'lucide-react';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';

export default function TasksPage() {
  return (
    <ModulePage
      title="Tasks"
      subtitle="See what needs doing, what's in progress, and what's finished — all in one place."
      icon={CheckCircle}
    >
      <div style={{ width: '100%', padding: 'var(--page-content-padding, 2rem)', boxSizing: 'border-box' }}>
        <KanbanBoard />
      </div>
    </ModulePage>
  );
}
