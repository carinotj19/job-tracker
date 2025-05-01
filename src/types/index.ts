export interface JobApplication {
  id: string
  company: string
  position: string
  status: 'applied' | 'interview' | 'offer' | 'rejected'
  applied_date: string
  notes?: string
  salary?: number
  location?: string
  job_url?: string
  created_at: string
  updated_at: string
}

export interface ApplicationStats {
  total_applications: number
  active_applications: number
  interview_rate: number
  offer_rate: number
  average_response_time: number
} 