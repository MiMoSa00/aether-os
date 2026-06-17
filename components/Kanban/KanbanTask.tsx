'use client';

import React from 'react';
import styles from './Kanban.module.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
}

export function KanbanTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={styles.task}
    >
      <p className={styles.taskContent}>{task.content}</p>
      <div className={styles.taskFooter}>
        <span className={`${styles.priority} ${styles[task.priority.toLowerCase() as keyof typeof styles]}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}
