'use client'

import { useState, useTransition, useEffect } from 'react'
import { logActivity, getTeamMembers } from '@/app/dashboard/actions'

const CATEGORIES = [
  'Design',
  'Development',
  'Marketing',
  'Research',
  'Sales',
  'Operations',
  'Other'
]

type TeamMember = { id: string; full_name: string }

type LogActivityFormProps = {
  isLeader: boolean
  currentUserId: string
  teamMembers?: TeamMember[] | null
}

export default function LogActivityForm({ isLeader, currentUserId, teamMembers: teamMembersProp }: LogActivityFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(teamMembersProp ?? [])
  const [logForTeammate, setLogForTeammate] = useState(false)

  useEffect(() => {
    if (!isLeader) return
    if (teamMembersProp != null) {
      setTeamMembers(teamMembersProp)
      return
    }
    getTeamMembers().then(members => setTeamMembers(members ?? []))
  }, [isLeader, teamMembersProp])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await logActivity(formData)
      if (result?.error) {
        setErrorMsg(result.error)
      } else if (result?.success) {
        setSuccess(true)
        const form = e.target as HTMLFormElement
        form.reset()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="max-w-[720px] pt-2">
      <h2 className="text-[13px] font-semibold text-text-bright mb-6">## LOG</h2>
      
      {success && (
        <div className="mb-6 bg-surface border border-[#333333] p-[10px] text-[12px] text-text-primary flex gap-2">
          <span className="text-text-bright">&gt; ok</span> <span>activity logged</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-surface border border-[#333333] p-[10px] text-[12px] text-text-primary flex gap-2">
          <span className="text-[#555555]">&gt; err</span> <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-[24px]">
        {isLeader && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-surface p-[12px] border border-border">
            <div className="flex items-center gap-3">
              <input
                id="logForTeammate"
                type="checkbox"
                checked={logForTeammate}
                onChange={(e) => setLogForTeammate(e.target.checked)}
                className="w-4 h-4 rounded-none border border-border bg-background checked:bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface cursor-pointer flex items-center justify-center relative after:content-[''] after:hidden checked:after:block after:w-2 after:h-2 after:bg-black"
              />
              <label htmlFor="logForTeammate" className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] cursor-pointer">
                Log for teammate
              </label>
            </div>

            {logForTeammate && (
              <div className="sm:ml-auto relative w-full sm:w-64 mt-2 sm:mt-0">
                <select
                  name="userId"
                  className="w-full appearance-none bg-surface border border-border px-[12px] py-[10px] text-[13px] text-text-primary rounded-none focus:border-text-bright focus:outline-none cursor-pointer"
                  defaultValue={currentUserId}
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id} className="bg-surface text-text-primary py-[8px] px-[12px]">
                      {member.full_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-secondary pointer-events-none">▾</div>
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="taskName" className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]">
            Task Name
          </label>
          <input
            type="text"
            id="taskName"
            name="taskName"
            required
            className="block w-full bg-surface border border-border rounded-none px-[12px] py-[10px] text-[13px] text-text-primary placeholder-muted focus:border-text-bright focus:outline-none transition-colors"
            placeholder="// task name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={300}
            className="block w-full bg-surface border border-border rounded-none px-[12px] py-[10px] text-[13px] text-text-primary placeholder-muted focus:border-text-bright focus:outline-none transition-colors resize-none"
            placeholder="// add any extra details..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div>
            <label htmlFor="category" className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                required
                className="block w-full appearance-none bg-surface border border-border px-[12px] py-[10px] text-[13px] text-text-primary rounded-none focus:border-text-bright focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-surface text-muted">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-surface text-text-primary">{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-secondary pointer-events-none">▾</div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]">
              Time Spent
            </label>
            <div className="flex items-center gap-[12px]">
              <div className="flex-1 relative">
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  min="0"
                  max="24"
                  placeholder="0"
                  className="block w-full bg-surface border border-border rounded-none px-[12px] py-[10px] text-[13px] text-text-primary placeholder-muted focus:border-text-bright focus:outline-none transition-colors text-left"
                />
                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] text-muted pointer-events-none">hrs</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="number"
                  id="minutes"
                  name="minutes"
                  min="0"
                  max="59"
                  placeholder="0"
                  className="block w-full bg-surface border border-border rounded-none px-[12px] py-[10px] text-[13px] text-text-primary placeholder-muted focus:border-text-bright focus:outline-none transition-colors text-left"
                />
                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] text-muted pointer-events-none">mins</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-start sm:justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center items-center py-[10px] px-[20px] rounded-none bg-white text-black text-[12px] font-semibold hover:bg-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
          >
            {isPending ? '[ ... ]' : '[ log activity ]'}
          </button>
        </div>
      </form>
    </div>
  )
}
