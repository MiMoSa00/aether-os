'use client';

import React from 'react';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';
import { Button } from '@/components/ui/Button';
import { Plus, Filter } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function ProjectsPage() {
  const { addTask } = useData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Project Board</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Manage and track your agency's active projects.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} />
            Filter
          </Button>
          <Button 
            onClick={() => addTask('todo', 'New Strategic Project', 'Medium')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            New Project
          </Button>
        </div>
      </section>

      <KanbanBoard />
    </div>
  );
}
