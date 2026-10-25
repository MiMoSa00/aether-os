'use client';

import React, { useState } from 'react';
import styles from './Kanban.module.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Pencil, Calendar, User, ChevronDown, Check, X } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface Task {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
  description?: string;
  dueDate?: string;
  assignee?: string;
  progress?: number;
}

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
};

const PRIORITY_LABELS: Record<string, string> = {
  High:   '🔴 Urgent',
  Medium: '🟡 Normal',
  Low:    '🟢 Low',
};

export function KanbanTask({ task, isDone }: { task: Task; isDone?: boolean }) {
  const { deleteTask, updateTask } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editAssignee, setEditAssignee] = useState(task.assignee || '');
  const [editProgress, setEditProgress] = useState(task.progress ?? 0);

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
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    updateTask(task.id, {
      content: editContent.trim(),
      description: editDesc.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
      assignee: editAssignee.trim() || undefined,
      progress: editProgress,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(task.content);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || '');
    setEditAssignee(task.assignee || '');
    setEditProgress(task.progress ?? 0);
    setIsEditing(false);
  };

  const progress = task.progress ?? 0;

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className={styles.taskEditing}>
        <div className={styles.editHeader}>
          <span className={styles.editTitle}>Edit Task</span>
          <button onClick={handleCancelEdit} className={styles.editCancelBtn} title="Cancel"><X size={16} /></button>
        </div>

        <div className={styles.editField}>
          <label className={styles.editLabel}>What needs to be done?</label>
          <input
            className={styles.editInput}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.editField}>
          <label className={styles.editLabel}>More details (optional)</label>
          <textarea
            className={styles.editTextarea}
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            rows={2}
            placeholder="Add a short description..."
          />
        </div>

        <div className={styles.editRow}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>How urgent?</label>
            <select className={styles.editSelect} value={editPriority} onChange={e => setEditPriority(e.target.value as any)}>
              <option value="High">🔴 Urgent</option>
              <option value="Medium">🟡 Normal</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Due date</label>
            <input
              type="date"
              className={styles.editInput}
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.editRow}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Who&apos;s working on it?</label>
            <input
              className={styles.editInput}
              value={editAssignee}
              onChange={e => setEditAssignee(e.target.value)}
              placeholder="Name..."
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Progress: {editProgress}%</label>
            <input
              type="range"
              min={0} max={100} step={5}
              value={editProgress}
              onChange={e => setEditProgress(Number(e.target.value))}
              className={styles.editRange}
            />
          </div>
        </div>

        <div className={styles.editActions}>
          <button onClick={handleCancelEdit} className={styles.editCancelFullBtn}>Cancel</button>
          <button onClick={handleSaveEdit} className={styles.editSaveBtn}>
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.task} glow-dark`}
    >
      {/* Drag handle area + actions */}
      <div className={styles.taskTopBar}>
        <span className={`${styles.priority} ${styles[task.priority.toLowerCase() as keyof typeof styles]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <div className={styles.taskActions}>
          <button
            className={styles.taskActionBtn}
            onClick={e => { e.stopPropagation(); setIsEditing(true); }}
            title="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            className={`${styles.taskActionBtn} ${styles.taskDeleteBtn}`}
            onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
            title="Remove task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className={styles.taskContent} style={isDone ? { textDecoration: 'line-through', opacity: 0.55 } : {}}>
        {task.content}
      </p>

      {task.description && (
        <p className={styles.taskDesc}>{task.description}</p>
      )}

      {/* Progress bar — hide for done tasks */}
      {!isDone && (
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPct}>{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className={styles.taskFooter}>
        {task.assignee && (
          <span className={styles.taskMeta}>
            <User size={11} /> {task.assignee}
          </span>
        )}
        {task.dueDate && (
          <span
            className={styles.taskMeta}
            style={!isDone && isOverdue(task.dueDate) ? { color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)' } : {}}
          >
            <Calendar size={11} />
            {!isDone && isOverdue(task.dueDate) ? '⚠ ' : ''}{task.dueDate}
          </span>
        )}
        {isDone && (
          <span className={styles.taskMeta} style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.06)' }}>
            ✓ Done
          </span>
        )}
      </div>
    </div>
  );
}
