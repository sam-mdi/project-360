import { useRef, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WavyBlock } from '../ui/WavyBlock';
import type { TimeBlockWithMeta } from '../../hooks/useTimeBlocks';
import { timeToMinutes } from '../../lib/utils';
import { useRoutine } from '../../stores/useRoutine';
import { todayStr } from '../../lib/utils';

interface TimelineProps {
  blocks: TimeBlockWithMeta[];
  onBlockClick: (id: string) => void;
  selectedId?: string | null;
  date?: string;
}

function SortableBlock({ block, onClick, isFirst, isLast, isSelected }: {
  block: TimeBlockWithMeta;
  onClick: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : isSelected ? 10 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <WavyBlock
        color={block.color}
        label={block.label}
        icon={block.icon}
        startTime={block.startTime}
        duration={block.duration}
        isActive={block.isActive}
        minutesIn={block.minutesIn}
        minutesLeft={block.minutesLeft}
        progress={block.progress}
        onClick={onClick}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
}

export function Timeline({ blocks, onBlockClick, selectedId, date }: TimelineProps) {
  const { reorderBlocks } = useRoutine();
  const targetDate = date ?? todayStr();
  const activeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const newOrder = arrayMove(blocks, oldIndex, newIndex).map((b) => b.id);
    reorderBlocks(targetDate, newOrder);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
          <span className="text-2xl">🌅</span>
        </div>
        <p className="font-semibold text-stone-500">No blocks yet</p>
        <p className="text-sm mt-1">Tap + to add your first time block</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex gap-4 px-4 py-3">
      {/* Hour markers */}
      <div className="flex flex-col" style={{ width: 36, flexShrink: 0 }}>
        {blocks.map((block) => {
          const hour = Math.floor(timeToMinutes(block.startTime) / 60);
          const height = Math.max(80, block.duration * 1.6);
          return (
            <div
              key={block.id}
              style={{ height: `${height}px`, minHeight: `${height}px` }}
              className="flex items-start pt-3"
            >
              <span className="text-xs font-semibold text-stone-400">{hour}</span>
            </div>
          );
        })}
      </div>

      {/* Blocks */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 flex flex-col gap-0">
            {blocks.map((block, i) => (
              <div key={block.id} ref={block.isActive ? activeRef : undefined}>
                <SortableBlock
                  block={block}
                  onClick={() => onBlockClick(block.id)}
                  isFirst={i === 0}
                  isLast={i === blocks.length - 1}
                  isSelected={selectedId === block.id}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
