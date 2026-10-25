'use client';

import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import styles from './Kanban.module.css';
import { KanbanColumn } from './KanbanColumn';
import { useData } from '@/context/DataContext';
import { CheckCircle, Clock, ListTodo } from 'lucide-react';

export function KanbanBoard() {
  const { tasks, columns, moveTask } = useData();
  const columnOrder = ['todo', 'in-progress', 'done'];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    moveTask(active.id as string, over.id as string);
  };

  // Board summary stats
  const todoCount       = columns['todo']?.taskIds?.length || 0;
  const inProgressCount = columns['in-progress']?.taskIds?.length || 0;
  const doneCount       = columns['done']?.taskIds?.length || 0;
  const totalCount      = todoCount + inProgressCount + doneCount;
  const donePercent     = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className={styles.board}>
      {/* Summary Bar */}
      {totalCount > 0 && (
        <div className={styles.boardSummary}>
          <div className={styles.summaryItem}>
            <ListTodo size={15} />
            <span>{todoCount} waiting</span>
          </div>
          <div className={styles.summaryItem}>
            <Clock size={15} />
            <span>{inProgressCount} in progress</span>
          </div>
          <div className={styles.summaryItem}>
            <CheckCircle size={15} />
            <span>{doneCount} finished</span>
          </div>
          <div className={styles.summaryProgress}>
            <span>{donePercent}% complete</span>
            <div className={styles.summaryProgressTrack}>
              <div
                className={styles.summaryProgressFill}
                style={{ width: `${donePercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.columnsContainer}>
          {columnOrder.map((columnId) => {
            const column = columns[columnId as keyof typeof columns];
            if (!column) return null;
            const columnTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(Boolean);

            return (
              <SortableContext
                key={column.id}
                items={column.taskIds}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn column={column} tasks={columnTasks} />
              </SortableContext>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
