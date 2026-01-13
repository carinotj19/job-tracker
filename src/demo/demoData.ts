import type { Company, Contact, Interview, JobApplication } from '../types/database.types'

export interface DemoUserRow {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string | null
}

export interface DemoDatabase {
  companies: Company[]
  contacts: Contact[]
  job_applications: JobApplication[]
  interviews: Interview[]
  users: DemoUserRow[]
}

export const DEMO_USER_ID = '7ff1703c-c1ff-4869-b9aa-f58e5c4ff2d0'
export const DEMO_ADMIN_ID = 'b7b7b7b7-b7b7-b7b7-b7b7-b7b7b7b7b7b7'
export const DEMO_USER_EMAIL = 'demo@example.com'
export const DEMO_ADMIN_EMAIL = 'admin@example.com'

const COMPANY_IDS = {
  techcorp: 'c1111111-1111-1111-1111-111111111111',
  datasystems: 'c2222222-2222-2222-2222-222222222222',
  innovate: 'c3333333-3333-3333-3333-333333333333',
  creative: 'c4444444-4444-4444-4444-444444444444',
  cloud: 'c5555555-5555-5555-5555-555555555555',
  finserv: 'c6666666-6666-6666-6666-666666666666',
  healthcare: 'c7777777-7777-7777-7777-777777777777'
}

const APPLICATION_IDS = {
  frontend: 'a1111111-1111-1111-1111-111111111111',
  backend: 'a2222222-2222-2222-2222-222222222222',
  fullstack: 'a3333333-3333-3333-3333-333333333333',
  designer: 'a4444444-4444-4444-4444-444444444444',
  devops: 'a5555555-5555-5555-5555-555555555555',
  product: 'a6666666-6666-6666-6666-666666666666',
  data: 'a7777777-7777-7777-7777-777777777777'
}

const CONTACT_IDS = {
  john: 'd1111111-1111-1111-1111-111111111111',
  sarah: 'd2222222-2222-2222-2222-222222222222',
  michael: 'd3333333-3333-3333-3333-333333333333',
  emily: 'd4444444-4444-4444-4444-444444444444',
  robert: 'd5555555-5555-5555-5555-555555555555'
}

const INTERVIEW_IDS = {
  frontendPhone: 'f1111111-1111-1111-1111-111111111111',
  frontendTech: 'f2222222-2222-2222-2222-222222222222',
  fullstackFirst: 'f3333333-3333-3333-3333-333333333333',
  fullstackFinal: 'f4444444-4444-4444-4444-444444444444',
  productIntro: 'f5555555-5555-5555-5555-555555555555',
  productRound2: 'f6666666-6666-6666-6666-666666666666'
}

export function createDemoDatabase(): DemoDatabase {
  const now = Date.now()
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const daysFromNow = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString()

  const companies: Company[] = [
    {
      id: COMPANY_IDS.techcorp,
      name: 'TechCorp Inc.',
      website: 'https://techcorp.example.com',
      industry: 'Technology',
      location: 'San Francisco, CA',
      description: 'AI and ML solutions for enterprise teams.',
      company_size: '501-1000',
      notes: 'Fast hiring cycle for senior roles.',
      created_at: daysAgo(360),
      user_id: DEMO_USER_ID
    },
    {
      id: COMPANY_IDS.datasystems,
      name: 'DataSystems Ltd',
      website: 'https://datasystems.example.com',
      industry: 'Software',
      location: 'Austin, TX',
      description: 'Enterprise data management platform.',
      company_size: '201-500',
      notes: 'Strong engineering culture.',
      created_at: daysAgo(330),
      user_id: DEMO_USER_ID
    },
    {
      id: COMPANY_IDS.innovate,
      name: 'Innovate Solutions',
      website: 'https://innovate.example.com',
      industry: 'Software Development',
      location: 'New York, NY',
      description: 'Custom software and digital transformation.',
      company_size: '51-200',
      notes: 'Remote friendly for product roles.',
      created_at: daysAgo(300),
      user_id: DEMO_USER_ID
    },
    {
      id: COMPANY_IDS.creative,
      name: 'Creative Designs',
      website: 'https://creativedesigns.example.com',
      industry: 'Design',
      location: 'Los Angeles, CA',
      description: 'UI/UX and brand design agency.',
      company_size: '11-50',
      notes: 'Portfolio review required.',
      created_at: daysAgo(280),
      user_id: DEMO_USER_ID
    },
    {
      id: COMPANY_IDS.cloud,
      name: 'Cloud Systems',
      website: 'https://cloudsystems.example.com',
      industry: 'Cloud Computing',
      location: 'Seattle, WA',
      description: 'Cloud infrastructure and DevOps services.',
      company_size: '51-200',
      notes: 'Heavy AWS usage.',
      created_at: daysAgo(260),
      user_id: DEMO_USER_ID
    },
    {
      id: COMPANY_IDS.finserv,
      name: 'FinServ Inc',
      website: 'https://finserv.example.com',
      industry: 'Finance',
      location: 'Chicago, IL',
      description: 'Financial services and technology.',
      company_size: '1001-5000',
      notes: 'Hybrid schedule.',
      created_at: daysAgo(240),
      user_id: DEMO_USER_ID
    },
    {
      id: COMPANY_IDS.healthcare,
      name: 'HealthCare Plus',
      website: 'https://healthcare-plus.example.com',
      industry: 'Healthcare',
      location: 'Boston, MA',
      description: 'Healthcare technology and services.',
      company_size: '501-1000',
      notes: 'Data security focus.',
      created_at: daysAgo(220),
      user_id: DEMO_USER_ID
    }
  ]

  const job_applications: JobApplication[] = [
    {
      id: APPLICATION_IDS.frontend,
      title: 'Senior Frontend Developer',
      status: 'interviewing',
      applied_date: daysAgo(14),
      company_id: COMPANY_IDS.techcorp,
      salary_range: '$120K - $150K',
      job_posting_url: 'https://techcorp.example.com/careers/123',
      description: 'Lead the UI platform team working on Vue and React.',
      notes: 'Reached out to recruiter for timeline.',
      created_at: daysAgo(14),
      updated_at: daysAgo(7),
      user_id: DEMO_USER_ID
    },
    {
      id: APPLICATION_IDS.backend,
      title: 'Backend Engineer',
      status: 'applied',
      applied_date: daysAgo(10),
      company_id: COMPANY_IDS.datasystems,
      salary_range: '$110K - $130K',
      job_posting_url: 'https://datasystems.example.com/jobs/backend',
      description: 'Build scalable services with Node.js and PostgreSQL.',
      notes: 'Submitted take-home challenge.',
      created_at: daysAgo(10),
      updated_at: daysAgo(10),
      user_id: DEMO_USER_ID
    },
    {
      id: APPLICATION_IDS.fullstack,
      title: 'Full Stack Developer',
      status: 'offered',
      applied_date: daysAgo(30),
      company_id: COMPANY_IDS.innovate,
      salary_range: '$130K - $160K',
      job_posting_url: 'https://innovate.example.com/careers',
      description: 'Build customer-facing web apps with modern stack.',
      notes: 'Offer received, awaiting final negotiation.',
      created_at: daysAgo(30),
      updated_at: daysAgo(5),
      user_id: DEMO_USER_ID
    },
    {
      id: APPLICATION_IDS.designer,
      title: 'UI/UX Designer',
      status: 'rejected',
      applied_date: daysAgo(40),
      company_id: COMPANY_IDS.creative,
      salary_range: '$90K - $110K',
      job_posting_url: 'https://creativedesigns.example.com/jobs/designer',
      description: 'Create intuitive user interfaces for web and mobile.',
      notes: 'Followed up after rejection for feedback.',
      created_at: daysAgo(40),
      updated_at: daysAgo(20),
      user_id: DEMO_USER_ID
    },
    {
      id: APPLICATION_IDS.devops,
      title: 'DevOps Engineer',
      status: 'applied',
      applied_date: daysAgo(18),
      company_id: COMPANY_IDS.cloud,
      salary_range: '$125K - $145K',
      job_posting_url: 'https://cloudsystems.example.com/careers/devops',
      description: 'Build CI/CD pipelines and maintain cloud systems.',
      notes: 'Waiting for recruiter response.',
      created_at: daysAgo(18),
      updated_at: daysAgo(18),
      user_id: DEMO_USER_ID
    },
    {
      id: APPLICATION_IDS.product,
      title: 'Product Manager',
      status: 'interviewing',
      applied_date: daysAgo(6),
      company_id: COMPANY_IDS.techcorp,
      salary_range: '$140K - $170K',
      job_posting_url: 'https://techcorp.example.com/careers/456',
      description: 'Drive roadmap for analytics product line.',
      notes: 'Hiring manager liked the case study.',
      created_at: daysAgo(6),
      updated_at: daysAgo(2),
      user_id: DEMO_USER_ID
    },
    {
      id: APPLICATION_IDS.data,
      title: 'Data Scientist',
      status: 'applied',
      applied_date: daysAgo(22),
      company_id: COMPANY_IDS.healthcare,
      salary_range: '$135K - $165K',
      job_posting_url: 'https://healthcare-plus.example.com/jobs/data',
      description: 'Analyze healthcare data and build predictive models.',
      notes: 'Awaiting initial response.',
      created_at: daysAgo(22),
      updated_at: daysAgo(22),
      user_id: DEMO_USER_ID
    }
  ]

  const contacts: Contact[] = [
    {
      id: CONTACT_IDS.john,
      name: 'John Smith',
      title: 'Senior Recruiter',
      email: 'john.smith@techcorp.example.com',
      phone: '(555) 123-4567',
      company_id: COMPANY_IDS.techcorp,
      notes: 'Initial contact for the Senior Frontend role.',
      created_at: daysAgo(200),
      user_id: DEMO_USER_ID
    },
    {
      id: CONTACT_IDS.sarah,
      name: 'Sarah Johnson',
      title: 'HR Manager',
      email: 'sarah.j@datasystems.example.com',
      phone: '(555) 234-5678',
      company_id: COMPANY_IDS.datasystems,
      notes: 'Coordinated first interview for Backend role.',
      created_at: daysAgo(190),
      user_id: DEMO_USER_ID
    },
    {
      id: CONTACT_IDS.michael,
      name: 'Michael Chen',
      title: 'CTO',
      email: 'michael@innovate.example.com',
      phone: '(555) 345-6789',
      company_id: COMPANY_IDS.innovate,
      notes: 'Technical interviewer for Full Stack role.',
      created_at: daysAgo(180),
      user_id: DEMO_USER_ID
    },
    {
      id: CONTACT_IDS.emily,
      name: 'Emily Davis',
      title: 'Design Director',
      email: 'emily@creativedesigns.example.com',
      phone: '(555) 456-7890',
      company_id: COMPANY_IDS.creative,
      notes: 'Reviewed portfolio during UI/UX interview.',
      created_at: daysAgo(175),
      user_id: DEMO_USER_ID
    },
    {
      id: CONTACT_IDS.robert,
      name: 'Robert Wilson',
      title: 'DevOps Lead',
      email: 'robert@cloudsystems.example.com',
      phone: '(555) 567-8901',
      company_id: COMPANY_IDS.cloud,
      notes: 'Discussed infrastructure experience.',
      created_at: daysAgo(170),
      user_id: DEMO_USER_ID
    }
  ]

  const interviews: Interview[] = [
    {
      id: INTERVIEW_IDS.frontendPhone,
      job_application_id: APPLICATION_IDS.frontend,
      interview_date: daysAgo(5),
      interview_type: 'phone',
      contact_id: CONTACT_IDS.john,
      notes: 'Initial screening call.',
      status: 'completed',
      created_at: daysAgo(6),
      user_id: DEMO_USER_ID
    },
    {
      id: INTERVIEW_IDS.frontendTech,
      job_application_id: APPLICATION_IDS.frontend,
      interview_date: daysFromNow(3),
      interview_type: 'video',
      contact_id: CONTACT_IDS.john,
      notes: 'Live coding session with team.',
      status: 'scheduled',
      created_at: daysAgo(2),
      user_id: DEMO_USER_ID
    },
    {
      id: INTERVIEW_IDS.fullstackFirst,
      job_application_id: APPLICATION_IDS.fullstack,
      interview_date: daysAgo(18),
      interview_type: 'video',
      contact_id: CONTACT_IDS.michael,
      notes: 'Architecture discussion.',
      status: 'completed',
      created_at: daysAgo(19),
      user_id: DEMO_USER_ID
    },
    {
      id: INTERVIEW_IDS.fullstackFinal,
      job_application_id: APPLICATION_IDS.fullstack,
      interview_date: daysAgo(15),
      interview_type: 'onsite',
      notes: 'Final round with leadership.',
      status: 'completed',
      created_at: daysAgo(16),
      user_id: DEMO_USER_ID
    },
    {
      id: INTERVIEW_IDS.productIntro,
      job_application_id: APPLICATION_IDS.product,
      interview_date: daysAgo(3),
      interview_type: 'phone',
      contact_id: CONTACT_IDS.john,
      notes: 'Intro call with recruiter.',
      status: 'completed',
      created_at: daysAgo(4),
      user_id: DEMO_USER_ID
    },
    {
      id: INTERVIEW_IDS.productRound2,
      job_application_id: APPLICATION_IDS.product,
      interview_date: daysFromNow(9),
      interview_type: 'video',
      notes: 'Second round with product team.',
      status: 'scheduled',
      created_at: daysAgo(1),
      user_id: DEMO_USER_ID
    }
  ]

  const users: DemoUserRow[] = [
    {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      created_at: daysAgo(365),
      last_sign_in_at: daysAgo(1)
    },
    {
      id: DEMO_ADMIN_ID,
      email: DEMO_ADMIN_EMAIL,
      created_at: daysAgo(500),
      last_sign_in_at: daysAgo(2)
    }
  ]

  return {
    companies,
    contacts,
    job_applications,
    interviews,
    users
  }
}
