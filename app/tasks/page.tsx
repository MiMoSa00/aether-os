'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { CheckCircle, Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';
import { useState } from 'react';
import { useData } from '@/context/DataContext';

export default function TasksPage() {
  const { addTask } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    if (newContent.trim()) {
      addTask('todo', newContent, 'Medium');
      setNewContent('');
      setShowAdd(false);
    }
  };

  return (
    <ModulePage 
      title="Tasks" 
      subtitle="Optimize your agency's velocity and neural task distribution." 
      icon={CheckCircle}
    >
      <div style={{ width: '100%', padding: 'var(--page-content-padding, 2rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'var(--accent-blue)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} /> New Task
          </button>
        </div>

        {showAdd && (
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            marginBottom: '2rem',
            border: '1px solid var(--surface-border)'
          }}>
            <input 
              autoFocus
              placeholder="Enter task objective..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              style={{ 
                width: '100%', 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '1.1rem',
                outline: 'none',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleAdd} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Add Node</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <KanbanBoard />
      </div>
    </ModulePage>
  );
}
