export interface Company {
  id: string
  name: string
  website?: string
  industry?: string
  location?: string
  description?: string
  company_size?: string
  notes?: string
  created_at: string
  user_id: string
}

export interface Contact {
  id: string
  name: string
  title?: string
  email?: string
  phone?: string
  company_id?: string
  notes?: string
  created_at: string
  user_id: string
}

export interface JobApplication {
  id: string
  title: string
  company_id?: string
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'withdrawn'
  salary_range?: string
  job_posting_url?: string
  description?: string
  notes?: string
  applied_date: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface Interview {
  id: string
  job_application_id: string
  interview_date: string
  interview_type: 'phone' | 'video' | 'onsite' | 'technical' | 'other'
  contact_id?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  user_id: string
}

export interface Database {
  companies: Company[]
  contacts: Contact[]
  job_applications: JobApplication[]
  interviews: Interview[]
} 