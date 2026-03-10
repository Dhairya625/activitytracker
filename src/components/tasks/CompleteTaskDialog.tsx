'use client'

import { useState } from 'react'
import { TaskInfo } from '@/types/tasks'
import { updateTaskStatus } from '@/app/dashboard/task-actions'
import { logActivity } from '@/app/dashboard/actions'

const CATEGORIES = [
    'Development',
    'Design',
    'Research',
    'Documentation',
    'Meetings',
    'Planning',
    'Other'
]

export default function CompleteTaskDialog({
    task,
    currentUserId,
    onClose,
    onSaved
}: {
    task: TaskInfo,
    currentUserId: string,
    onClose: () => void,
    onSaved: () => void
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        // 1. Log the activity corresponding to the task
        const logResult = await logActivity(formData)

        if (logResult.error) {
            setError(logResult.error)
            setIsSubmitting(false)
            return
        }

        // 2. Mark the task as completed
        const completeResult = await updateTaskStatus(task.id, 'completed')

        if (completeResult.error) {
            setError(completeResult.error)
            setIsSubmitting(false)
            return
        }

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-sm w-full max-w-md shadow-2xl p-6">
                <h2 className="text-[18px] font-bold text-text-bright mb-1 font-mono tracking-tight">Complete Task</h2>
                <p className="text-[13px] text-muted mb-6">Log the activity details to complete &quot;{task.title}&quot;.</p>

                {error && (
                    <div className="bg-error/10 border border-error/50 text-error p-3 rounded-sm mb-4 text-[13px]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="taskName" value={task.title} />
                    <input type="hidden" name="description" value={`Completed task: ${task.title}`} />
                    {/* Default the user to whoever completed the task, since there can be multiple assignees now */}
                    <input type="hidden" name="userId" value={currentUserId} />

                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-muted uppercase tracking-[0.05em]">Category</label>
                        <select
                            name="category"
                            className="w-full bg-background border border-border block px-3 py-2.5 text-[14px] text-text-primary rounded-sm focus:outline-none focus:border-accent appearance-none tracking-[0.02em]"
                            required
                            defaultValue=""
                        >
                            <option value="" disabled>Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="flex items-center justify-between text-[12px] font-bold text-muted uppercase tracking-[0.05em]">
                                Hours
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="hours"
                                    min="0"
                                    max="24"
                                    placeholder="0"
                                    required
                                    className="w-full bg-background border border-border block px-3 py-2.5 text-[14px] text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono placeholder:text-muted/30"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted uppercase font-bold tracking-[0.05em] pointer-events-none">
                                    HR
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center justify-between text-[12px] font-bold text-muted uppercase tracking-[0.05em]">
                                Minutes
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="minutes"
                                    min="0"
                                    max="59"
                                    placeholder="0"
                                    required
                                    className="w-full bg-background border border-border block px-3 py-2.5 text-[14px] text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono placeholder:text-muted/30"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted uppercase font-bold tracking-[0.05em] pointer-events-none">
                                    MIN
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 border border-border text-[13px] font-bold uppercase tracking-[0.05em] rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground text-[13px] font-bold uppercase tracking-[0.05em] rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Complete Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
