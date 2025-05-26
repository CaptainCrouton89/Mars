'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Contact } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, MapPin, Calendar, Globe, ExternalLink } from 'lucide-react'

interface ContactDetailPageProps {
  params: { id: string }
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && params.id) {
      fetchContact()
    }
  }, [user, params.id])

  const fetchContact = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setContact(data)
    } catch (error) {
      console.error('Error fetching contact:', error)
      router.push('/dashboard/contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contact || !confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id)

      if (error) throw error
      router.push('/dashboard/contacts')
    } catch (error) {
      console.error('Error deleting contact:', error)
      setDeleting(false)
    }
  }

  const getContactDisplayName = (contact: Contact) => {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    return name || contact.email || 'Unnamed Contact'
  }

  const getContactInitials = (contact: Contact) => {
    const firstName = contact.first_name || ''
    const lastName = contact.last_name || ''
    return (firstName[0] + lastName[0]).toUpperCase() || '?'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/contacts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xl font-medium text-primary-foreground">
                  {getContactInitials(contact)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{getContactDisplayName(contact)}</h1>
                {contact.company && (
                  <p className="text-lg text-muted-foreground">{contact.company}</p>
                )}
                {contact.role_title && (
                  <p className="text-muted-foreground">{contact.role_title}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/contacts/${contact.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{contact.address}</p>
                  </div>
                </div>
              )}

              {contact.birthday && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Birthday</p>
                    <p className="text-muted-foreground">{formatDate(contact.birthday)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.company && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-muted-foreground">{contact.company}</p>
                  </div>
                </div>
              )}

              {contact.source && (
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
                  <div>
                    <p className="font-medium">Source</p>
                    <p className="text-muted-foreground">{contact.source}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="font-medium">Social Links</p>
                <div className="space-y-2">
                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {contact.twitter_url && (
                    <a
                      href={contact.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {contact.website && (
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {contact.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{contact.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Created: {formatDate(contact.created_at)}
            </p>
            <p className="text-sm text-muted-foreground">
              Updated: {formatDate(contact.updated_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}