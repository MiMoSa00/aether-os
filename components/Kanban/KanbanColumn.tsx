'use client';

import React from 'react';
import styles from './Kanban.module.css';
import { KanbanTask } from './KanbanTask';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useData } from '@/context/DataContext';
import { Modal } from '@/components/ui/Modal';
import modalStyles from '@/components/ui/Modal.module.css';
import { Button } from '@/components/ui/Button';

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface Task {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
}

export function KanbanColumn({ column, tasks }: { column: Column, tasks: Task[] }) {
  const { addTask } = useData();
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [taskContent, setTaskContent] = React.useState('');
  const [priority, setPriority] = React.useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskContent) {
      addTask(column.id, taskContent, priority);
      setIsModalOpen(false);
      setTaskContent('');
      setPriority('Medium');
    }
  };

  return (
    <div ref={setNodeRef} className={styles.column}>
      <div className={styles.columnHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 className={styles.columnTitle}>{column.title}</h3>
          <span className={styles.taskCount}>{tasks.length}</span>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <KanbanTask key={task.id} task={task} />
        ))}
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem', 
            background: 'transparent', 
            border: '1px dashed var(--surface-border)', 
            borderRadius: 'var(--radius-md)',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            marginTop: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Task"
        description={`Adding task to ${column.title}`}
      >
        <form onSubmit={handleAddTask} className={modalStyles.form}>
          <div className={modalStyles.field}>
            <label className={modalStyles.label}>Task Content</label>
            <input 
              className={modalStyles.input} 
              placeholder="What needs to be done?" 
              value={taskContent}
              onChange={(e) => setTaskContent(e.target.value)}
              required
            />
          </div>
          <div className={modalStyles.field}>
            <label className={modalStyles.label}>Priority</label>
            <select 
              className={modalStyles.input}
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              style={{ background: '#222' }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className={modalStyles.actions}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
