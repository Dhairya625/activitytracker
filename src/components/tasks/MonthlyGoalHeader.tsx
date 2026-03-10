'use client'

import { useState, useEffect } from 'react'
import { fetchMonthlyGoal, updateMonthlyGoal } from '@/app/dashboard/task-actions'
import { Target, Edit2 } from 'lucide-react'

export default function MonthlyGoalHeader() {
    const [goalText, setGoalText] = useState('Loading...')
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Get current month-year (e.g. "March 2026")
    const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())

    useEffect(() => {
        async function loadGoal() {
            const goal = await fetchMonthlyGoal(currentMonthYear)
            if (goal) {
                setGoalText(goal.goal_text)
                setEditValue(goal.goal_text)
            } else {
                setGoalText('No goal set for this month.')
                setEditValue('')
            }
        }
        loadGoal()
    }, [currentMonthYear])

    async function handleSave() {
        setIsSaving(true)
        const result = await updateMonthlyGoal(currentMonthYear, editValue)
        if (result.success) {
            setGoalText(editValue)
            setIsEditing(false)
        } else {
            alert('Failed to update: ' + result.error)
        }
        setIsSaving(false)
    }

    return (
        <div className="bg-surface border border-border p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-full hidden md:block">
                    <Target className="text-accent" size={24} />
                </div>
                <div>
                    <h2 className="text-[12px] font-bold text-muted uppercase tracking-[0.1em] mb-1">
                        Month Goal · {currentMonthYear}
                    </h2>
                    {!isEditing ? (
                        <div className="text-[18px] md:text-[20px] font-medium text-text-bright">
                            {goalText}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full md:w-[400px] bg-background border border-accent block px-3 py-2 text-[16px] text-text-primary rounded-sm focus:outline-none"
                            autoFocus
                            disabled={isSaving}
                        />
                    )}
                </div>
            </div>

            {!isEditing ? (
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-text-primary transition-colors uppercase tracking-[0.05em]"
                >
                    <Edit2 size={14} />
                    Edit Goal
                </button>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="px-4 py-2 border border-border text-[13px] font-bold uppercase tracking-[0.05em] rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-accent text-accent-foreground text-[13px] font-bold uppercase tracking-[0.05em] rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </div>
    )
}
