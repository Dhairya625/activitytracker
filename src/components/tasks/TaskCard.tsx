'use client'

import { useState, useEffect } from 'react'
import { TaskInfo } from '@/types/tasks'
import { CheckCircle, Circle, GripVertical } from 'lucide-react'

export default function TaskCard({
    task,
    onDragStart,
    isCompleted = false,
    onComplete
}: {
    task: TaskInfo,
    onDragStart?: (e: React.DragEvent) => void,
    isCompleted?: boolean,
    onComplete?: () => void
}) {
    // Format date only on client to avoid hydration mismatch (locale/timezone can differ server vs client)
    const [formattedDate, setFormattedDate] = useState<string | null>(null)
    useEffect(() => {
        setFormattedDate(new Date(task.created_at).toLocaleDateString())
    }, [task.created_at])

    return (
        <div
            draggable={!isCompleted}
            onDragStart={onDragStart}
            className={`
        bg-surface border p-3 rounded-sm flex items-start gap-3 transition-colors group
        ${isCompleted ? 'border-border/50 opacity-70' : 'border-border hover:border-accent/50 cursor-grab active:cursor-grabbing'}
      `}
        >
            {!isCompleted && (
                <div className="mt-1 text-muted/50 group-hover:text-muted transition-colors">
                    <GripVertical size={16} />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-[14px] font-semibold tracking-[0.02em] font-mono truncate ${isCompleted ? 'line-through text-muted' : 'text-text-primary'}`}>
                        {task.title}
                    </h4>
                    {!isCompleted && onComplete && (
                        <button
                            onClick={onComplete}
                            className="text-muted hover:text-accent transition-colors flex-shrink-0"
                            aria-label="Mark as complete"
                        >
                            <Circle size={18} />
                        </button>
                    )}
                    {isCompleted && (
                        <div className="text-accent flex-shrink-0">
                            <CheckCircle size={18} />
                        </div>
                    )}
                </div>

                {task.description && (
                    <p className="text-[12px] text-muted mt-1 line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono tracking-wider text-muted/70 uppercase truncate max-w-[80%]">
                        {task.task_assignees && task.task_assignees.length > 0
                            ? task.task_assignees.map(a => a.profiles?.full_name).join(', ')
                            : 'Unassigned'}
                    </span>
                    <span className="text-[10px] text-muted/50">
                        {formattedDate ?? '—'}
                    </span>
                </div>
            </div>
        </div>
    )
}
