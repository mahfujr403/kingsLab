import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import { Card } from '../ui/card';

interface DraggableCardProps {
  id: number;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
  isDragMode: boolean;
  className?: string;
}

const ITEM_TYPE = 'CARD';

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  index,
  onMove,
  children,
  isDragMode,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isDragMode,
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { id: number; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Connect drag and drop refs
  if (isDragMode) {
    drag(drop(ref));
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragMode ? 'move' : 'default',
      }}
      className={`relative ${className}`}
    >
      {isDragMode && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <div className={isDragMode ? 'pl-8' : ''}>
        {children}
      </div>
    </div>
  );
};
