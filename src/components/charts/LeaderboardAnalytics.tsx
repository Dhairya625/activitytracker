'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfWeek, startOfMonth } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

type AggregatedStat = {
  user_id: string
  full_name: string
  total_hours: number
  total_tasks: number
}

const TIME_RANGES = ['This Week', 'This Month', 'All Time']

export default function LeaderboardAnalytics({ isLeader }: { isLeader: boolean }) {
  const [stats, setStats] = useState<AggregatedStat[]>([])
  const [timeRange, setTimeRange] = useState('This Week')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        let query = supabase.from('activities').select('user_id, hours, profiles(full_name)')
        
        if (timeRange !== 'All Time') {
          const now = new Date()
          const start = timeRange === 'This Week' ? startOfWeek(now) : startOfMonth(now)
          query = query.gte('logged_at', start.toISOString())
        }

        const { data, error } = await query

        if (error) throw error

        const aggMap: Record<string, AggregatedStat> = {}

        data?.forEach((row: any) => {
          const uid = row.user_id
          const name = row.profiles?.full_name || 'Unknown'
          if (!aggMap[uid]) {
            aggMap[uid] = { user_id: uid, full_name: name, total_hours: 0, total_tasks: 0 }
          }
          aggMap[uid].total_hours += Number(row.hours)
          aggMap[uid].total_tasks += 1
        })

        const finalStats = Object.values(aggMap).sort((a, b) => b.total_hours - a.total_hours)
        finalStats.forEach(s => s.total_hours = Number(s.total_hours.toFixed(2)))
        
        setStats(finalStats)
      } catch (err) {
        console.error('Error fetching leaderboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [timeRange, supabase])

  const totalTeamHours = useMemo(() => stats.reduce((sum, s) => sum + s.total_hours, 0), [stats])
  const totalTeamTasks = useMemo(() => stats.reduce((sum, s) => sum + s.total_tasks, 0), [stats])

  return (
    <div className="max-w-[960px] pt-2">
      {/* Chart Section */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[24px] gap-4">
          <h2 className="text-[13px] font-semibold text-text-bright uppercase">## STATS</h2>
          
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-surface border border-border px-[12px] py-[8px] text-[13px] text-text-primary rounded-none focus:border-text-bright focus:outline-none cursor-pointer pr-8"
            >
              {TIME_RANGES.map(t => <option key={t} value={t} className="bg-surface text-text-primary">{t}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-text-secondary pointer-events-none">▾</div>
          </div>
        </div>

        <div className="h-[240px] w-full mb-[48px] bg-background">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center font-mono text-[12px] text-text-secondary">
              &gt; fetching...
            </div>
          ) : stats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={4} barCategoryGap={24}>
                <CartesianGrid stroke="#1a1a1a" vertical={false} />
                <XAxis 
                  dataKey="full_name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#555555', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#555555', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                />
                <Tooltip
                  cursor={{ fill: '#111111' }}
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '0px', padding: '10px', boxShadow: 'none' }}
                  itemStyle={{ color: '#e0e0e0', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                  labelStyle={{ color: '#888888', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}
                />
                <Legend 
                  iconType="square" 
                  iconSize={12} 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#888888', fontFamily: 'var(--font-mono)' }}
                  align="left"
                  verticalAlign="bottom"
                />
                <Bar yAxisId="left" name="Total Hours" dataKey="total_hours" fill="#ffffff" radius={[0, 0, 0, 0]} barSize={16} />
                <Bar yAxisId="left" name="Tasks Completed" dataKey="total_tasks" fill="#333333" radius={[0, 0, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-[12px] text-muted font-mono">
               &gt; no data for this range.
             </div>
          )}
        </div>
      </section>

      {/* Percentage Breakdown */}
      <section className="mt-[48px]">
        <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[24px]">## BREAKDOWN</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[48px] gap-y-[32px]">
          <div className="flex flex-col gap-[16px]">
             <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]">HOURS</div>
             {stats.map(member => {
               const pctHours = totalTeamHours > 0 ? Math.round((member.total_hours / totalTeamHours) * 100) : 0
               return (
                 <div key={`hours-${member.user_id}`} className="flex flex-col gap-[8px]">
                   <div className="flex justify-between items-end leading-none">
                     <span className="text-[12px] text-text-primary">{member.full_name}</span>
                     <span className="text-[11px] text-text-secondary w-8 text-right">{pctHours}%</span>
                   </div>
                   <div className="w-full h-[2px] bg-[#1a1a1a]">
                     <div className="h-[2px] bg-[#ffffff]" style={{ width: `${pctHours}%` }}></div>
                   </div>
                 </div>
               )
             })}
          </div>

          <div className="flex flex-col gap-[16px]">
             <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] mb-[8px]">TASKS</div>
             {stats.map(member => {
               const pctTasks = totalTeamTasks > 0 ? Math.round((member.total_tasks / totalTeamTasks) * 100) : 0
               return (
                 <div key={`tasks-${member.user_id}`} className="flex flex-col gap-[8px]">
                   <div className="flex justify-between items-end leading-none">
                     <span className="text-[12px] text-text-primary">{member.full_name}</span>
                     <span className="text-[11px] text-text-secondary w-8 text-right">{pctTasks}%</span>
                   </div>
                   <div className="w-full h-[2px] bg-[#1a1a1a]">
                     <div className="h-[2px] bg-[#ffffff]" style={{ width: `${pctTasks}%` }}></div>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      </section>

      {/* Admin Only Section */}
      {isLeader && (
        <section className="mt-[64px] pt-[24px] border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-[24px]">
            <div>
              <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em]">ADMIN CONTROLS</h3>
            </div>
            <Link 
              href="?tab=log" 
              className="text-[12px] font-semibold text-text-secondary border border-[#333333] bg-transparent py-[8px] px-[16px] hover:border-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background"
            >
              [ log for teammate ]
            </Link>
          </div>
          
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] font-normal">Member</th>
                  <th className="py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] font-normal text-right">Hours</th>
                  <th className="py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em] font-normal text-right">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {stats.length > 0 ? stats.map((stat) => (
                  <tr key={stat.user_id} className="border-b border-[#1a1a1a]">
                    <td className="py-[12px] text-[13px] text-text-primary font-normal">{stat.full_name}</td>
                    <td className="py-[12px] text-[13px] text-text-secondary text-right w-24 font-normal">{stat.total_hours}</td>
                    <td className="py-[12px] text-[13px] text-text-secondary text-right w-24 font-normal">{stat.total_tasks}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-[24px] text-[12px] text-muted text-center font-mono">&gt; no data for this range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
