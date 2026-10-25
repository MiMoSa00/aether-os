'use client';

import React from 'react';
import styles from './Kanban.module.css';
import { KanbanTask } from './KanbanTask';
import { Plus } from 'lucide-react';
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
  description?: string;
  dueDate?: string;
  assignee?: string;
  progress?: number;
}

// Human-friendly column display names
const COLUMN_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  'todo':        { label: 'Waiting to Start',     emoji: '📋', color: '#60a5fa' },
  'in-progress': { label: 'Currently Working On', emoji: '⚡', color: '#fbbf24' },
  'done':        { label: 'Finished',              emoji: '✅', color: '#34d399' },
};

export function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
  const { addTask } = useData();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [taskContent, setTaskContent] = React.useState('');
  const [taskDesc, setTaskDesc] = React.useState('');
  const [priority, setPriority] = React.useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = React.useState('');
  const [assignee, setAssignee] = React.useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskContent.trim()) {
      addTask(column.id, taskContent.trim(), priority, taskDesc.trim() || undefined, dueDate || undefined, assignee.trim() || undefined);
      setIsModalOpen(false);
      setTaskContent('');
      setTaskDesc('');
      setPriority('Medium');
      setDueDate('');
      setAssignee('');
    }
  };

  const colMeta = COLUMN_LABELS[column.id] || { label: column.title, emoji: '📌', color: '#a78bfa' };

  const isDoneColumn = column.id === 'done';

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ''} ${isDoneColumn ? styles.columnDone : ''}`}
    >
      <div className={styles.columnHeader}>
        <div className={styles.columnHeaderLeft}>
          <span className={styles.columnEmoji}>{colMeta.emoji}</span>
          <div>
            <h3 className={styles.columnTitle}>{colMeta.label}</h3>
            <span className={styles.taskCount} style={{ color: colMeta.color }}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>
        <button
          className={styles.addTaskBtn}
          onClick={() => setIsModalOpen(true)}
          title="Add new task"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className={styles.columnLine} style={{ background: colMeta.color }} />

      <div className={styles.taskList}>
        {tasks.filter(Boolean).map((task) => (
          <KanbanTask key={task.id} task={task} isDone={isDoneColumn} />
        ))}

        {tasks.length === 0 && (
          <div className={styles.emptyState}>
            <span>Drop tasks here or</span>
            <button onClick={() => setIsModalOpen(true)} className={styles.emptyAddBtn}>
              add one
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add task to "${colMeta.label}"`}
        description="Fill in the details below and hit Create Task."
      >
        <form onSubmit={handleAddTask} className={modalStyles.form}>
          <div className={modalStyles.field}>
            <label className={modalStyles.label}>What needs to be done? *</label>
            <input
              className={modalStyles.input}
              placeholder="e.g. Design the homepage banner"
              value={taskContent}
              onChange={(e) => setTaskContent(e.target.value)}
              required
            />
          </div>

          <div className={modalStyles.field}>
            <label className={modalStyles.label}>More details (optional)</label>
            <textarea
              className={modalStyles.input}
              placeholder="Any extra notes or context..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              rows={2}
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={modalStyles.field}>
              <label className={modalStyles.label}>How urgent is it?</label>
              <select
                className={modalStyles.input}
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{ background: 'var(--bg-main)' }}
              >
                <option value="High">🔴 Urgent</option>
                <option value="Medium">🟡 Normal</option>
                <option value="Low">🟢 Low priority</option>
              </select>
            </div>

            <div className={modalStyles.field}>
              <label className={modalStyles.label}>When is it due?</label>
              <input
                type="date"
                className={modalStyles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={modalStyles.field}>
            <label className={modalStyles.label}>Who&apos;s doing this? (optional)</label>
            <input
              className={modalStyles.input}
              placeholder="e.g. John, Sarah..."
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          <div className={modalStyles.actions}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
