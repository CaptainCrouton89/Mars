export interface Contact {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  role_title?: string
  notes?: string
  source?: string
  linkedin_url?: string
  twitter_url?: string
  website?: string
  address?: string
  birthday?: string
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  user_id: string
  contact_id: string
  name: string
  description?: string
  value?: number
  currency?: string
  stage: string
  expected_close_date?: string
  actual_close_date?: string
  priority?: number
  created_at: string
  updated_at: string
  contact?: Contact
}

export interface Interaction {
  id: string
  user_id: string
  contact_id: string
  opportunity_id?: string
  type: string
  date_of_interaction: string
  summary: string
  follow_up_needed: boolean
  follow_up_date?: string
  created_at: string
  updated_at: string
  contact?: Contact
  opportunity?: Opportunity
}

export interface Profile {
  id: string
  user_id: string
  time_zone?: string
  currency?: string
}

export const OPPORTUNITY_STAGES = [
  'Lead',
  'Contacted',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
] as const

export const INTERACTION_TYPES = [
  'Email',
  'Call',
  'Meeting',
  'Note',
  'LinkedIn',
  'Other'
] as const