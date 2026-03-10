'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

type NavbarProps = {
  userName: string
}

export default function Navbar({ userName }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="border-b border-border bg-background h-[48px]">
      <div className="max-w-[960px] mx-auto px-5 md:px-[40px] h-full flex justify-between items-center">
        <h1 className="text-[12px] font-semibold tracking-normal text-text-bright">
          &gt; activity_tracker
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-muted">{userName}</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-[12px] font-semibold text-text-secondary border border-[#333333] bg-transparent py-[8px] px-[16px] hover:border-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background disabled:opacity-30"
          >
            {isLoggingOut ? '[ ... ]' : '[ logout ]'}
          </button>
        </div>
      </div>
    </nav>
  )
}
