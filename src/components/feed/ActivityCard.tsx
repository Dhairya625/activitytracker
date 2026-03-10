import { formatDistanceToNow } from 'date-fns'
import { getInitials, formatTime } from '@/lib/utils'

export type Activity = {
  id: string
  task_name: string
  description: string | null
  category: string
  hours: number
  logged_at: string
  profiles: {
    full_name: string
  } | null
}

export default function ActivityCard({ activity }: { activity: Activity }) {
  const userName = activity.profiles?.full_name || 'Unknown User'
  const initials = getInitials(userName).toLowerCase()

  const timeAgo = formatDistanceToNow(new Date(activity.logged_at), { addSuffix: true })
  const formattedTime = formatTime(activity.hours)

  return (
    <div className="border-b border-[#1a1a1a] py-[16px] flex items-start gap-4 transition-colors hover:bg-[#0d0d0d] px-2 -mx-2">
      <div className="flex flex-col items-center gap-2 w-12 shrink-0">
        <div className="h-[32px] w-[32px] flex items-center justify-center text-[11px] font-semibold text-text-secondary bg-[#1a1a1a] border border-[#222222]">
          {initials}
        </div>
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1">
          <div className="flex items-center gap-2 truncate">
            <h3 className="text-[13px] font-semibold text-text-bright truncate">{activity.task_name}</h3>
            <span className="text-[11px] text-[#555555] lowercase shrink-0">
              [ {activity.category} ]
            </span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-text-secondary">{formattedTime}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            {activity.description && (
              <p className="text-[12px] text-text-secondary line-clamp-2 overflow-hidden leading-relaxed">
                {activity.description}
              </p>
            )}
            {!activity.description && <div className="h-4"></div>}
          </div>
          <div className="text-[11px] text-muted shrink-0 text-right">
            {userName.split(' ')[0]} • {timeAgo.replace('about ', '')}
          </div>
        </div>
      </div>
    </div>
  )
}
