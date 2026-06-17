'use client';

import React, { useState } from 'react';
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

export function KanbanBoard() {
  const { tasks, columns, moveTask } = useData();
  const columnOrder = ['todo', 'in-progress', 'done'];

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
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

  return (
    <div className={styles.board}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.columnsContainer}>
          {columnOrder.map((columnId) => {
            const column = columns[columnId as keyof typeof columns];
            const columnTasks = column.taskIds.map((taskId) => tasks[taskId]);

            return (
              <SortableContext 
                key={column.id} 
                items={column.taskIds} 
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn 
                  column={column} 
                  tasks={columnTasks} 
                />
              </SortableContext>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
