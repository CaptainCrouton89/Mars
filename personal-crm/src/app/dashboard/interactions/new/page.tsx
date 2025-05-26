'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Contact, Opportunity, INTERACTION_TYPES } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const interactionSchema = z.object({
  contact_id: z.string().min(1, 'Contact is required'),
  opportunity_id: z.string().optional(),
  type: z.enum(INTERACTION_TYPES),
  date_of_interaction: z.string().min(1, 'Date is required'),
  summary: z.string().min(1, 'Summary is required'),
  follow_up_needed: z.boolean(),
  follow_up_date: z.string().optional(),
}).refine((data) => {
  if (data.follow_up_needed && !data.follow_up_date) {
    return false
  }
  return true
}, {
  message: 'Follow-up date is required when follow-up is needed',
  path: ['follow_up_date'],
})

type InteractionFormData = z.infer<typeof interactionSchema>

export default function NewInteractionPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedContactOpportunities, setSelectedContactOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: 'Email',
      date_of_interaction: new Date().toISOString().slice(0, 16),
      follow_up_needed: false,
    },
  })

  const selectedContactId = watch('contact_id')
  const followUpNeeded = watch('follow_up_needed')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    if (selectedContactId) {
      const contactOpportunities = opportunities.filter(
        opp => opp.contact_id === selectedContactId
      )
      setSelectedContactOpportunities(contactOpportunities)
      setValue('opportunity_id', '')
    }
  }, [selectedContactId, opportunities, setValue])

  const fetchData = async () => {
    try {
      const [contactsResponse, opportunitiesResponse] = await Promise.all([
        supabase.from('contacts').select('*').order('first_name'),
        supabase.from('opportunities').select('*, contact:contacts(*)').order('name')
      ])

      if (contactsResponse.error) throw contactsResponse.error
      if (opportunitiesResponse.error) throw opportunitiesResponse.error

      setContacts(contactsResponse.data || [])
      setOpportunities(opportunitiesResponse.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const onSubmit = async (data: InteractionFormData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const interactionData = {
        ...data,
        user_id: user.id,
        opportunity_id: data.opportunity_id || null,
        follow_up_date: data.follow_up_needed ? data.follow_up_date : null,
      }

      const { error } = await supabase
        .from('interactions')
        .insert([interactionData])

      if (error) throw error

      router.push('/dashboard/interactions')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getContactDisplayName = (contact: Contact) => {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    const company = contact.company ? ` (${contact.company})` : ''
    return (name || contact.email || 'Unnamed Contact') + company
  }

  if (dataLoading) {
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
          <Link href="/dashboard/interactions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Log New Interaction</h1>
            <p className="text-muted-foreground">
              Record a communication or meeting
            </p>
          </div>
        </div>

        {contacts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  You need to have at least one contact before logging an interaction.
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
              <CardTitle>Interaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                {selectedContactOpportunities.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="opportunity_id">Related Opportunity (Optional)</Label>
                    <select
                      {...register('opportunity_id')}
                      id="opportunity_id"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">No opportunity</option>
                      {selectedContactOpportunities.map((opportunity) => (
                        <option key={opportunity.id} value={opportunity.id}>
                          {opportunity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <select
                      {...register('type')}
                      id="type"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {INTERACTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_interaction">Date & Time *</Label>
                    <Input
                      {...register('date_of_interaction')}
                      type="datetime-local"
                      id="date_of_interaction"
                    />
                    {errors.date_of_interaction && (
                      <p className="text-sm text-destructive">{errors.date_of_interaction.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary *</Label>
                  <textarea
                    {...register('summary')}
                    id="summary"
                    placeholder="Describe what was discussed or communicated..."
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.summary && (
                    <p className="text-sm text-destructive">{errors.summary.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      {...register('follow_up_needed')}
                      type="checkbox"
                      id="follow_up_needed"
                      className="rounded border-input"
                    />
                    <Label htmlFor="follow_up_needed">Follow-up needed</Label>
                  </div>

                  {followUpNeeded && (
                    <div className="space-y-2">
                      <Label htmlFor="follow_up_date">Follow-up Date</Label>
                      <Input
                        {...register('follow_up_date')}
                        type="date"
                        id="follow_up_date"
                      />
                      {errors.follow_up_date && (
                        <p className="text-sm text-destructive">{errors.follow_up_date.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging...' : 'Log Interaction'}
                  </Button>
                  <Link href="/dashboard/interactions">
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