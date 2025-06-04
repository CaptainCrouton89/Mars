'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (user) {
    router.push('/dashboard/contacts')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-8 py-8 flex justify-between items-center border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div className="text-3xl font-semibold text-primary">Mars CRM</div>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="outline" size="lg" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" className="font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center py-20">
        <div className="max-w-6xl animate-fade-in">
          <div className="mb-16">
            <div className="inline-block relative">
              <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-6 text-foreground">
                Mars CRM
              </h1>
              <p className="text-3xl md:text-4xl font-medium text-primary">
                Your Personal Space Station
              </p>
            </div>
          </div>
          
          <p className="text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
            Mission Control for your contacts, opportunities, and interactions. 
            Built for explorers who chart their own course.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24">
            <Link href="/auth">
              <Button size="lg" className="text-xl font-semibold px-12 py-6 shadow-lg hover:shadow-xl">
                Launch Mission
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-xl font-semibold px-12 py-6">
              Explore Features
            </Button>
          </div>

          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Mission Objectives</h2>
            <div className="grid md:grid-cols-3 gap-10 text-left">
              <div className="group relative h-full">
                <div className="bg-card p-10 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 relative h-full flex flex-col">
                  <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mb-8 shadow-sm mx-auto flex-shrink-0">
                    <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">Crew Manifest</h3>
                  <p className="text-lg text-muted-foreground font-medium text-center leading-relaxed flex-grow">
                    Command your contact database with rich profiles, social links, and mission-critical notes.
                  </p>
                </div>
              </div>

              <div className="group relative h-full">
                <div className="bg-card p-10 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 relative h-full flex flex-col">
                  <div className="w-20 h-20 bg-accent rounded-lg flex items-center justify-center mb-8 shadow-sm mx-auto flex-shrink-0">
                    <svg className="w-10 h-10 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">Mission Tracker</h3>
                  <p className="text-lg text-muted-foreground font-medium text-center leading-relaxed flex-grow">
                    Navigate opportunities through your pipeline from launch to successful landing.
                  </p>
                </div>
              </div>

              <div className="group relative h-full">
                <div className="bg-card p-10 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 relative h-full flex flex-col">
                  <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center mb-8 shadow-sm mx-auto flex-shrink-0">
                    <svg className="w-10 h-10 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">Comms Log</h3>
                  <p className="text-lg text-muted-foreground font-medium text-center leading-relaxed flex-grow">
                    Record transmissions and schedule follow-up missions with precision timing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-12 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">&copy; 2024 Mars CRM</p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Built for explorers who chart their own course</p>
        </div>
      </footer>
    </div>
  )
}
