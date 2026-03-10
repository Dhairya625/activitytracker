'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ActivityCard, { Activity } from './ActivityCard'
import { getTeamMembers } from '@/app/dashboard/actions'
import { startOfWeek, startOfMonth } from 'date-fns'

const CATEGORIES = ['All', 'Design', 'Development', 'Marketing', 'Research', 'Sales', 'Operations', 'Other']
const DATE_RANGES = ['All Time', 'This Week', 'This Month']

const PAGE_SIZE = 20

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  // Filters
  const [teamMembers, setTeamMembers] = useState<{id: string, full_name: string}[]>([])
  const [selectedMember, setSelectedMember] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDateRange, setSelectedDateRange] = useState('All Time')

  const supabase = createClient()

  // Load Team Members for Filter
  useEffect(() => {
    getTeamMembers().then(members => setTeamMembers(members))
  }, [])

  const fetchActivities = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setPage(0)
      }

      const currentPage = isLoadMore ? page + 1 : 0
      const from = currentPage * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('activities')
        .select(`
          id, task_name, description, category, hours, logged_at,
          profiles(full_name)
        `, { count: 'exact' })
        .order('logged_at', { ascending: false })

      // Apply Filters
      if (selectedMember !== 'All') {
        query = query.eq('user_id', selectedMember)
      }
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }
      if (selectedDateRange !== 'All Time') {
        const now = new Date()
        const start = selectedDateRange === 'This Week' ? startOfWeek(now) : startOfMonth(now)
        query = query.gte('logged_at', start.toISOString())
      }

      query = query.range(from, to)

      const { data, count, error } = await query

      if (error) throw error

      if (data) {
        const formattedData = data as unknown as Activity[]
        if (isLoadMore) {
          setActivities(prev => [...prev, ...formattedData])
          setPage(currentPage)
        } else {
          setActivities(formattedData)
        }

        if (count !== null) {
          setHasMore(formattedData.length > 0 && from + formattedData.length < count)
        } else {
          setHasMore(formattedData.length === PAGE_SIZE)
        }
      }
    } catch (e) {
      console.error('Error fetching activities:', e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [page, selectedMember, selectedCategory, selectedDateRange, supabase])

  // Initial fetch and filter triggers
  useEffect(() => {
    fetchActivities(false)
  }, [selectedMember, selectedCategory, selectedDateRange]) // Re-run fetch entirely when filters change

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activities_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      }, async (payload) => {
        const { data } = await supabase
          .from('activities')
          .select('id, task_name, description, category, hours, logged_at, profiles(full_name)')
          .eq('id', payload.new.id)
          .single()

        if (data) {
          const newAct = data as unknown as Activity
          let passesFilter = true
          if (selectedMember !== 'All' && payload.new.user_id !== selectedMember) passesFilter = false
          if (selectedCategory !== 'All' && payload.new.category !== selectedCategory) passesFilter = false
          if (passesFilter) {
            setActivities(prev => [newAct, ...prev])
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedMember, selectedCategory, supabase])

  return (
    <div className="max-w-[720px] pt-2">
      <h2 className="text-[13px] font-semibold text-text-bright mb-6 uppercase">## FEED</h2>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-[16px] mb-8">
        <div className="relative">
          <select 
            value={selectedMember} 
            onChange={e => setSelectedMember(e.target.value)}
            className="appearance-none bg-surface border border-border px-[12px] py-[8px] text-[13px] text-text-primary rounded-none focus:border-text-bright focus:outline-none cursor-pointer pr-8"
          >
            <option value="All" className="bg-surface text-text-primary">All Members</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id} className="bg-surface text-text-primary">{m.full_name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-secondary pointer-events-none">▾</div>
        </div>

        <div className="relative">
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="appearance-none bg-surface border border-border px-[12px] py-[8px] text-[13px] text-text-primary rounded-none focus:border-text-bright focus:outline-none cursor-pointer pr-8"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-surface text-text-primary">{c}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-secondary pointer-events-none">▾</div>
        </div>

        <div className="relative">
          <select 
            value={selectedDateRange} 
            onChange={e => setSelectedDateRange(e.target.value)}
            className="appearance-none bg-surface border border-border px-[12px] py-[8px] text-[13px] text-text-primary rounded-none focus:border-text-bright focus:outline-none cursor-pointer pr-8"
          >
            {DATE_RANGES.map(d => (
              <option key={d} value={d} className="bg-surface text-text-primary">{d}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-secondary pointer-events-none">▾</div>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-[12px] text-text-secondary font-mono">
          &gt; fetching...
        </div>
      ) : activities.length > 0 ? (
        <div className="flex flex-col">
          {activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}

          {hasMore && (
            <div className="pt-8 pb-8 flex justify-start">
              <button
                onClick={() => fetchActivities(true)}
                disabled={loadingMore}
                className="text-[12px] font-semibold text-text-secondary border border-[#333333] bg-transparent py-[10px] px-[20px] hover:border-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background disabled:opacity-30"
              >
                {loadingMore ? '[ loading... ]' : '[ load more ]'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-[12px] text-muted font-mono">
          &gt; no activities logged yet.
        </div>
      )}
    </div>
  )
}
