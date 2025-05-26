'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Opportunity, OPPORTUNITY_STAGES } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, DollarSign, Calendar, User, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchOpportunities()
    }
  }, [user])

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = searchTerm === '' || 
      opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = stageFilter === 'all' || opportunity.stage === stageFilter
    
    return matchesSearch && matchesStage
  })

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-gray-100 text-gray-800'
      case 'Contacted': return 'bg-blue-100 text-blue-800'
      case 'Proposal': return 'bg-yellow-100 text-yellow-800'
      case 'Negotiation': return 'bg-orange-100 text-orange-800'
      case 'Won': return 'bg-green-100 text-green-800'
      case 'Lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (value: number | null, currency: string | null) => {
    if (!value) return null
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    })
    return formatter.format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const getContactDisplayName = (contact: any) => {
    if (!contact) return 'Unknown Contact'
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    return name || contact.email || 'Unnamed Contact'
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
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <p className="text-muted-foreground">
              Track your sales opportunities and pipeline
            </p>
          </div>
          <Link href="/dashboard/opportunities/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="all">All Stages</option>
            {OPPORTUNITY_STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || stageFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding your first opportunity.'}
              </p>
              {!searchTerm && stageFilter === 'all' && (
                <Link href="/dashboard/opportunities/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Opportunity
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <Link key={opportunity.id} href={`/dashboard/opportunities/${opportunity.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate mb-1">
                          {opportunity.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{getContactDisplayName(opportunity.contact)}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {opportunity.value && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          <span className="font-medium">
                            {formatCurrency(opportunity.value, opportunity.currency)}
                          </span>
                        </div>
                      )}
                      
                      {opportunity.expected_close_date && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Expected: {formatDate(opportunity.expected_close_date)}</span>
                        </div>
                      )}

                      {opportunity.priority && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="text-xs">Priority: {opportunity.priority}/5</span>
                        </div>
                      )}

                      {opportunity.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {opportunity.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}