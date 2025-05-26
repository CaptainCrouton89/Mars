'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Contact } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const contactSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  role_title: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  birthday: z.string().optional(),
}).refine((data) => data.first_name || data.last_name || data.email, {
  message: 'At least one of first name, last name, or email is required',
  path: ['first_name'],
})

type ContactFormData = z.infer<typeof contactSchema>

interface EditContactPageProps {
  params: Promise<{ id: string }>
}

export default function EditContactPage({ params: paramsPromise }: EditContactPageProps) {
  const [params, setParams] = useState<{ id: string } | null>(null)
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    paramsPromise.then(setParams)
  }, [paramsPromise])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const fetchContact = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', params?.id)
        .single()

      if (error) throw error
      setContact(data)
      
      // Reset form with contact data
      reset({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        role_title: data.role_title || '',
        notes: data.notes || '',
        source: data.source || '',
        linkedin_url: data.linkedin_url || '',
        twitter_url: data.twitter_url || '',
        website: data.website || '',
        address: data.address || '',
        birthday: data.birthday || '',
      })
    } catch (error) {
      console.error('Error fetching contact:', error)
      router.push('/dashboard/contacts')
    } finally {
      setLoading(false)
    }
  }, [params?.id, reset, router])

  useEffect(() => {
    if (user && params?.id) {
      fetchContact()
    }
  }, [user, params?.id, fetchContact])

  const onSubmit = async (data: ContactFormData) => {
    if (!user || !contact) return

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData = {
        ...data,
        email: data.email || null,
        linkedin_url: data.linkedin_url || null,
        twitter_url: data.twitter_url || null,
        website: data.website || null,
        birthday: data.birthday || null,
      }

      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contact.id)

      if (error) throw error

      router.push(`/dashboard/contacts/${contact.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContactDisplayName = (contact: Contact | null) => {
    if (!contact) return 'Contact'
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

  if (!contact) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Contact not found</h2>
          <Link href="/dashboard/contacts">
            <Button>Back to Contacts</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/contacts/${contact.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Contact</h1>
            <p className="text-muted-foreground">
              Update {getContactDisplayName(contact)}&apos;s information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    {...register('first_name')}
                    id="first_name"
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    {...register('last_name')}
                    id="last_name"
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  {...register('phone')}
                  id="phone"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    {...register('company')}
                    id="company"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role_title">Job Title</Label>
                  <Input
                    {...register('role_title')}
                    id="role_title"
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  {...register('source')}
                  id="source"
                  placeholder="How did you meet? (e.g., LinkedIn, conference, referral)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    {...register('linkedin_url')}
                    id="linkedin_url"
                    placeholder="https://linkedin.com/in/..."
                  />
                  {errors.linkedin_url && (
                    <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    {...register('twitter_url')}
                    id="twitter_url"
                    placeholder="https://twitter.com/..."
                  />
                  {errors.twitter_url && (
                    <p className="text-sm text-destructive">{errors.twitter_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    {...register('website')}
                    id="website"
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  {...register('address')}
                  id="address"
                  placeholder="Enter full address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  {...register('birthday')}
                  type="date"
                  id="birthday"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  placeholder="Add any additional notes about this contact..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Contact'}
                </Button>
                <Link href={`/dashboard/contacts/${contact.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}