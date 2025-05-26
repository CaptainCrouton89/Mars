'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Contact, OPPORTUNITY_STAGES } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const opportunitySchema = z.object({
  name: z.string().min(1, 'Opportunity name is required'),
  contact_id: z.string().min(1, 'Contact is required'),
  description: z.string().optional(),
  value: z.coerce.number().positive('Value must be positive').optional(),
  currency: z.string().optional(),
  stage: z.enum(OPPORTUNITY_STAGES),
  expected_close_date: z.string().optional(),
  priority: z.coerce.number().min(1).max(5).optional(),
})

type OpportunityFormData = z.infer<typeof opportunitySchema>

export default function NewOpportunityPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [contactsLoading, setContactsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      stage: 'Lead',
      currency: 'USD',
    },
  })

  useEffect(() => {
    if (user) {
      fetchContacts()
    }
  }, [user])

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setContactsLoading(false)
    }
  }

  const onSubmit = async (data: OpportunityFormData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const opportunityData = {
        ...data,
        user_id: user.id,
        value: data.value || null,
        expected_close_date: data.expected_close_date || null,
        priority: data.priority || null,
      }

      const { error } = await supabase
        .from('opportunities')
        .insert([opportunityData])

      if (error) throw error

      router.push('/dashboard/opportunities')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getContactDisplayName = (contact: Contact) => {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    const company = contact.company ? ` (${contact.company})` : ''
    return (name || contact.email || 'Unnamed Contact') + company
  }

  if (contactsLoading) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/opportunities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Opportunity</h1>
            <p className="text-muted-foreground">
              Create a new sales opportunity
            </p>
          </div>
        </div>

        {contacts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  You need to have at least one contact before creating an opportunity.
                </p>
                <Link href="/dashboard/contacts/new">
                  <Button>Add Contact First</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Opportunity Name *</Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="Enter opportunity name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_id">Contact *</Label>
                  <select
                    {...register('contact_id')}
                    id="contact_id"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {getContactDisplayName(contact)}
                      </option>
                    ))}
                  </select>
                  {errors.contact_id && (
                    <p className="text-sm text-destructive">{errors.contact_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    {...register('description')}
                    id="description"
                    placeholder="Describe the opportunity..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      {...register('value')}
                      type="number"
                      id="value"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    {errors.value && (
                      <p className="text-sm text-destructive">{errors.value.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      {...register('currency')}
                      id="currency"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <select
                      {...register('stage')}
                      id="stage"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {OPPORTUNITY_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    {errors.stage && (
                      <p className="text-sm text-destructive">{errors.stage.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority (1-5)</Label>
                    <select
                      {...register('priority')}
                      id="priority"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select priority</option>
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <option key={priority} value={priority}>
                          {priority} - {priority === 1 ? 'Low' : priority === 3 ? 'Medium' : priority === 5 ? 'High' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.priority && (
                      <p className="text-sm text-destructive">{errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_close_date">Expected Close Date</Label>
                  <Input
                    {...register('expected_close_date')}
                    type="date"
                    id="expected_close_date"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Opportunity'}
                  </Button>
                  <Link href="/dashboard/opportunities">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}