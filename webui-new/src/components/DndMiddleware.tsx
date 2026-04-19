import { useState } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { GripVertical, X } from 'lucide-react'

interface DndMiddlewareAssignProps {
  available: string[]
  assigned: string[]
  onChange: (assigned: string[]) => void
}

function DraggableMiddleware({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs cursor-grab active:cursor-grabbing select-none transition-opacity ${isDragging ? 'opacity-30' : ''}`}>
      <GripVertical size={12} className="text-zinc-600" />
      {children}
    </div>
  )
}

function DropZone({ id, children, isOver }: { id: string; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`min-h-[60px] rounded-lg border-2 border-dashed p-2 transition-colors ${isOver ? 'border-brand bg-brand/5' : 'border-zinc-700 bg-zinc-900/50'}`}>
      {children}
    </div>
  )
}

export function DndMiddlewareAssign({ available, assigned, onChange }: DndMiddlewareAssignProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { isOver: isOverDrop, setNodeRef: setDropRef } = useDroppable({ id: 'assigned-zone' })
  const { isOver: isOverPool, setNodeRef: setPoolRef } = useDroppable({ id: 'pool-zone' })

  const unassigned = available.filter(m => !assigned.includes(m))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const mw = active.id as string

    if (over.id === 'assigned-zone' && !assigned.includes(mw)) {
      onChange([...assigned, mw])
    }
    if (over.id === 'pool-zone' && assigned.includes(mw)) {
      onChange(assigned.filter(m => m !== mw))
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        {/* Available pool */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Available middlewares — drag to assign</p>
          <div ref={setPoolRef} className={`flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-lg border border-dashed transition-colors ${isOverPool ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-800'}`}>
            {unassigned.length === 0 && <span className="text-[10px] text-zinc-600">All assigned</span>}
            {unassigned.map(mw => (
              <DraggableMiddleware key={mw} id={mw}>{mw}</DraggableMiddleware>
            ))}
          </div>
        </div>

        {/* Assigned drop zone */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Assigned to this router — drag to remove</p>
          <div ref={setDropRef} className={`flex flex-wrap gap-1.5 min-h-[48px] p-2 rounded-lg border-2 border-dashed transition-colors ${isOverDrop ? 'border-brand bg-brand/5' : 'border-zinc-700'}`}>
            {assigned.length === 0 && <span className="text-[10px] text-zinc-600 py-1">Drop middlewares here</span>}
            {assigned.map(mw => (
              <DraggableMiddleware key={mw} id={mw}>
                {mw}
                <button onClick={(e) => { e.stopPropagation(); onChange(assigned.filter(m => m !== mw)) }} className="ml-1 text-zinc-500 hover:text-red-400">
                  <X size={10} />
                </button>
              </DraggableMiddleware>
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand/20 border border-brand rounded-lg text-xs text-brand font-semibold shadow-lg">
            <GripVertical size={12} />
            {activeId}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
