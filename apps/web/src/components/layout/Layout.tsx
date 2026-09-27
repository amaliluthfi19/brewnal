import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <Navbar />
      {/* Bottom padding clears the fixed bottom nav + raised add button */}
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-32">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
