'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Interaction, Contact, INTERACTION_TYPES } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, MessageSquare, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchInteractions()
    }
  }, [user])

  const fetchInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          *,
          contact:contacts(*),
          opportunity:opportunities(*)
        `)
        .order('date_of_interaction', { ascending: false })

      if (error) throw error
      setInteractions(data || [])
    } catch (error) {
      console.error('Error fetching interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = searchTerm === '' || 
      interaction.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || interaction.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const getContactDisplayName = (contact: Contact | null) => {
    if (!contact) return 'Unknown Contact'
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    return name || contact.email || 'Unnamed Contact'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const isFollowUpOverdue = (followUpDate: string | null) => {
    if (!followUpDate) return false
    return new Date(followUpDate) < new Date()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Interactions</h1>
            <p className="text-muted-foreground">
              Track all your communications and follow-ups
            </p>
          </div>
          <Link href="/dashboard/interactions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Interaction
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search interactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="all">All Types</option>
            {INTERACTION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {filteredInteractions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No interactions found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by logging your first interaction.'}
              </p>
              {!searchTerm && typeFilter === 'all' && (
                <Link href="/dashboard/interactions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Interaction
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((interaction) => (
              <Card key={interaction.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                          {interaction.type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(interaction.date_of_interaction)}
                        </span>
                        {interaction.follow_up_needed && interaction.follow_up_date && (
                          <div className={`flex items-center text-sm ${
                            isFollowUpOverdue(interaction.follow_up_date) 
                              ? 'text-destructive' 
                              : 'text-orange-600'
                          }`}>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Follow-up: {formatDate(interaction.follow_up_date)}
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-1">
                        {getContactDisplayName(interaction.contact || null)}
                      </CardTitle>
                      {interaction.contact?.company && (
                        <p className="text-sm text-muted-foreground">
                          {interaction.contact.company}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm">{interaction.summary}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <Link 
                          href={`/dashboard/contacts/${interaction.contact_id}`}
                          className="hover:text-primary hover:underline"
                        >
                          View Contact
                        </Link>
                      </div>
                      {interaction.opportunity && (
                        <div className="flex items-center">
                          <span className="mr-2">Opportunity:</span>
                          <Link 
                            href={`/dashboard/opportunities/${interaction.opportunity_id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {interaction.opportunity.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}