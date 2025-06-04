'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Opportunity } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, User, Building, Target, TrendingUp, AlertCircle } from 'lucide-react'

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OpportunityDetailPage({ params: paramsPromise }: OpportunityDetailPageProps) {
  const [params, setParams] = useState<{ id: string } | null>(null)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    paramsPromise.then(setParams)
  }, [paramsPromise])

  const fetchOpportunity = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          contact:contacts(*)
        `)
        .eq('id', params?.id)
        .single()

      if (error) throw error
      setOpportunity(data)
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      router.push('/dashboard/opportunities')
    } finally {
      setLoading(false)
    }
  }, [params?.id, router])

  useEffect(() => {
    if (user && params?.id) {
      fetchOpportunity()
    }
  }, [user, params?.id, fetchOpportunity])

  const handleDelete = async () => {
    if (!opportunity || !confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunity.id)

      if (error) throw error
      router.push('/dashboard/opportunities')
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (value: number | null, currency: string = 'USD') => {
    if (value === null || value === undefined) return 'Not set'
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    })
    return formatter.format(value)
  }

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'lead':
        return 'bg-gray-100 text-gray-800'
      case 'contacted':
        return 'bg-blue-100 text-blue-800'
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800'
      case 'negotiation':
        return 'bg-orange-100 text-orange-800'
      case 'won':
        return 'bg-green-100 text-green-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number | null) => {
    if (!priority) return 'Not set'
    if (priority <= 2) return 'Low'
    if (priority <= 3) return 'Medium'
    return 'High'
  }

  const getPriorityColor = (priority: number | null) => {
    if (!priority) return 'text-muted-foreground'
    if (priority <= 2) return 'text-green-600'
    if (priority <= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!opportunity) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">
            Opportunity not found
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            This opportunity may have been deleted or doesn&apos;t exist.
          </p>
          <Link href="/dashboard/opportunities">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const contactName = opportunity.contact ? 
    [opportunity.contact.first_name, opportunity.contact.last_name].filter(Boolean).join(' ') || 
    opportunity.contact.email || 
    'Unknown Contact' : 'No Contact'

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-1">{opportunity.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                  {opportunity.stage}
                </span>
                {opportunity.contact && (
                  <Link 
                    href={`/dashboard/contacts/${opportunity.contact.id}`}
                    className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <User className="h-3 w-3" />
                    <span>{contactName}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/opportunities/${opportunity.id}/edit`}>
              <Button variant="outline" size="default">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="ghost"
              size="default"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Value</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(opportunity.value ?? null, opportunity.currency || 'USD')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stage</p>
                  <p className="text-sm text-foreground">{opportunity.stage}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <p className={`text-sm ${getPriorityColor(opportunity.priority ?? null)}`}>
                    {getPriorityLabel(opportunity.priority ?? null)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/opportunities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Opportunities
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected Close Date</p>
                    <p className="text-sm">
                      {formatDate(opportunity.expected_close_date ?? null)}
                    </p>
                  </div>
                </div>

                {opportunity.actual_close_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Actual Close Date</p>
                      <p className="text-sm">
                        {formatDate(opportunity.actual_close_date)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created</p>
                    <p className="text-sm">
                      {formatDate(opportunity.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {opportunity.description && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{opportunity.description}</p>
            </CardContent>
          </Card>
        )}

        {opportunity.contact && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-medium">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{contactName}</p>
                  {opportunity.contact.role_title && (
                    <p className="text-xs text-muted-foreground">{opportunity.contact.role_title}</p>
                  )}
                  {opportunity.contact.company && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span>{opportunity.contact.company}</span>
                    </div>
                  )}
                </div>
                <Link href={`/dashboard/contacts/${opportunity.contact.id}`}>
                  <Button variant="outline" size="sm">
                    View Contact
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}