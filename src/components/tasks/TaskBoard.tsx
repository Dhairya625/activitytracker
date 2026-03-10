'use client'

import { useState, useEffect } from 'react'
import { TaskInfo } from '@/types/tasks'
import {
    fetchTasks,
    createTask,
    deleteTask,
} from '@/app/dashboard/task-actions'
import { getTeamMembers } from '@/app/dashboard/actions'
import MonthlyGoalHeader from './MonthlyGoalHeader'
import TaskCard from './TaskCard'
import CompleteTaskDialog from './CompleteTaskDialog'
import { Plus, Trash2 } from 'lucide-react'

export default function TaskBoard({ currentUserId }: { currentUserId: string }) {
    const [tasks, setTasks] = useState<TaskInfo[]>([])
    const [teamMembers, setTeamMembers] = useState<{ id: string, full_name: string }[]>([])
    const [isAddingTask, setIsAddingTask] = useState(false)
    const [isDragOverBin, setIsDragOverBin] = useState(false)
    const [isDragOverCompleted, setIsDragOverCompleted] = useState(false)

    // Dialog state
    const [taskToComplete, setTaskToComplete] = useState<TaskInfo | null>(null)

    useEffect(() => {
        async function loadData() {
            const [fetchedTasks, members] = await Promise.all([
                fetchTasks(),
                getTeamMembers()
            ])

            setTasks(fetchedTasks || [])
            setTeamMembers(members || [])
        }
        loadData()
    }, [])

    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId)
    }

    const handleDragOverBin = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOverBin(true)
    }

    const handleDragLeaveBin = () => {
        setIsDragOverBin(false)
    }

    const handleDropBin = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOverBin(false)
        const taskId = e.dataTransfer.getData('taskId')
        if (taskId) {
            // Optimistic update
            setTasks(prev => prev.filter(t => t.id !== taskId))
            await deleteTask(taskId)
        }
    }

    const handleDragOverCompleted = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOverCompleted(true)
    }

    const handleDragLeaveCompleted = () => {
        setIsDragOverCompleted(false)
    }

    const handleDropCompleted = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOverCompleted(false)
        const taskId = e.dataTransfer.getData('taskId')

        if (taskId) {
            const task = tasks.find(t => t.id === taskId)
            // Only prompt if it's currently pending
            if (task && task.status === 'pending') {
                openCompleteDialog(task)
            }
        }
    }

    const handleCompleteTaskSaved = async () => {
        // Reload tasks after logging activity
        const fetchedTasks = await fetchTasks()
        setTasks(fetchedTasks || [])
    }

    const openCompleteDialog = (task: TaskInfo) => {
        setTaskToComplete(task)
    }

    async function handleCreateTask(formData: FormData) {
        setIsAddingTask(false) // Optimistic hide
        const result = await createTask(formData)
        if (result.success) {
            const fetchedTasks = await fetchTasks()
            setTasks(fetchedTasks || [])
        } else {
            console.error(result.error)
            alert('Failed to create task: ' + result.error)
        }
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            <MonthlyGoalHeader />

            {/* Task Board Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-[1fr_1fr_200px]">
                {/* Pending Tasks Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-[14px] font-bold text-text-bright tracking-[0.05em] uppercase">Pending</h3>
                        <button
                            onClick={() => setIsAddingTask(!isAddingTask)}
                            className="text-muted hover:text-text-bright transition-colors"
                            aria-label="Add Task"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {isAddingTask && (
                        <form action={handleCreateTask} className="bg-surface p-4 rounded-sm border border-border flex flex-col gap-3">
                            <input
                                name="title"
                                type="text"
                                required
                                placeholder="Task title..."
                                className="w-full bg-background border border-border block px-3 py-2 text-[14px] text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono placeholder:text-muted/50"
                            />
                            <textarea
                                name="description"
                                placeholder="Description (optional)"
                                rows={2}
                                className="w-full bg-background border border-border block px-3 py-2 text-[14px] text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono placeholder:text-muted/50 resize-none"
                            />
                            <div className="border border-border rounded-sm bg-background p-3 max-h-[120px] overflow-y-auto w-full">
                                <label className="text-[12px] font-bold text-muted uppercase tracking-[0.05em] mb-2 block">Assignees</label>
                                <div className="flex flex-col gap-2">
                                    {teamMembers.map(member => (
                                        <label key={member.id} className="flex items-center gap-2 text-[14px] text-text-primary cursor-pointer hover:text-text-bright transition-colors">
                                            <input
                                                type="checkbox"
                                                name="assignedTo"
                                                value={member.id}
                                                className="accent-accent w-4 h-4 cursor-pointer"
                                            />
                                            {member.full_name}
                                        </label>
                                    ))}
                                    {teamMembers.length === 0 && (
                                        <span className="text-[13px] text-muted italic">No team members found</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-accent text-accent-foreground py-2 text-[14px] font-semibold hover:bg-accent/90 transition-colors rounded-sm uppercase tracking-[0.05em]">
                                    Save
                                </button>
                                <button type="button" onClick={() => setIsAddingTask(false)} className="flex-1 bg-surface border border-border text-text-primary py-2 text-[14px] font-semibold hover:bg-surface-hover transition-colors rounded-sm uppercase tracking-[0.05em]">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="flex flex-col gap-3 min-h-[200px]">
                        {pendingTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onComplete={() => openCompleteDialog(task)}
                            />
                        ))}
                        {pendingTasks.length === 0 && !isAddingTask && (
                            <div className="text-muted text-[13px] italic border border-dashed border-border rounded-sm p-4 text-center mt-2">
                                No pending tasks
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Tasks Column */}
                <div
                    className="flex flex-col gap-4"
                    onDragOver={handleDragOverCompleted}
                    onDragLeave={handleDragLeaveCompleted}
                    onDrop={handleDropCompleted}
                >
                    <div className={`flex items-center justify-between border-b pb-2 transition-colors ${isDragOverCompleted ? 'border-accent' : 'border-border'}`}>
                        <h3 className={`text-[14px] font-bold tracking-[0.05em] uppercase transition-colors ${isDragOverCompleted ? 'text-accent' : 'text-text-bright'}`}>Completed</h3>
                    </div>

                    <div className={`flex flex-col gap-3 min-h-[200px] p-2 -mx-2 rounded-sm transition-colors ${isDragOverCompleted ? 'bg-surface-hover' : ''}`}>
                        {completedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                isCompleted
                            />
                        ))}
                        {completedTasks.length === 0 && (
                            <div className="text-muted text-[13px] italic border border-dashed border-border rounded-sm p-4 text-center mt-2">
                                Drag tasks here or click complete
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Bin */}
                <div className="hidden lg:flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-[14px] font-bold text-text-bright tracking-[0.05em] uppercase">Bin</h3>
                    </div>

                    <div
                        className={`
              flex-1 min-h-[200px] border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-3 transition-colors text-muted
              ${isDragOverBin
                                ? 'border-error text-error bg-error/5'
                                : 'border-border/50 hover:border-border hover:bg-surface/50'
                            }
            `}
                        onDragOver={handleDragOverBin}
                        onDragLeave={handleDragLeaveBin}
                        onDrop={handleDropBin}
                    >
                        <Trash2 size={32} className={isDragOverBin ? 'text-error' : 'text-muted/50'} />
                        <span className="text-[12px] font-mono tracking-wider">DRAG TO DELETE</span>
                    </div>
                </div>
            </div>

            {/* Complete Task Dialog */}
            {taskToComplete && (
                <CompleteTaskDialog
                    task={taskToComplete}
                    currentUserId={currentUserId}
                    onClose={() => setTaskToComplete(null)}
                    onSaved={handleCompleteTaskSaved}
                />
            )}
        </div>
    )
}
