import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import TabNav from '@/components/layout/TabNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch the user's profile to get their name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={userName} />
      <TabNav />
      {/* 
        We use flex-1 to allow the main content to fill the remaining screen real estate.
      */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-5 md:px-[40px] py-[40px]">
        {children}
      </main>
    </div>
  )
}
