// ESM seed script
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Setup environment variables
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env file
try {
  const envPath = resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
} catch (error) {
  console.log('No .env file found, using environment variables if available');
}

// Get Supabase connection information
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Make sure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Default user ID - you can replace this with an actual user ID from your auth.users table
const DEFAULT_USER_ID = '7ff1703c-c1ff-4869-b9aa-f58e5c4ff2d0';

async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    console.log('Using Supabase URL:', supabaseUrl);

    // 1. Add companies first
    const companies = [
      {
        name: 'TechCorp Inc.',
        website: 'https://techcorp.example.com',
        industry: 'Technology',
        location: 'San Francisco, CA',
        description: 'Leading technology company specializing in AI and ML solutions',
        company_size: '501-1000',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'DataSystems Ltd',
        website: 'https://datasystems.example.com',
        industry: 'Software',
        location: 'Austin, TX',
        description: 'Enterprise data management solutions',
        company_size: '201-500',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Innovate Solutions',
        website: 'https://innovate.example.com',
        industry: 'Software Development',
        location: 'New York, NY',
        description: 'Custom software development and digital transformation',
        company_size: '51-200',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Creative Designs',
        website: 'https://creativedesigns.example.com',
        industry: 'Design',
        location: 'Los Angeles, CA',
        description: 'UI/UX and graphic design agency',
        company_size: '11-50',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Cloud Systems',
        website: 'https://cloudsystems.example.com',
        industry: 'Cloud Computing',
        location: 'Seattle, WA',
        description: 'Cloud infrastructure and DevOps solutions',
        company_size: '51-200',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'FinServ Inc',
        website: 'https://finserv.example.com',
        industry: 'Finance',
        location: 'Chicago, IL',
        description: 'Financial services and technology',
        company_size: '1001-5000',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'HealthCare Plus',
        website: 'https://healthcare-plus.example.com',
        industry: 'Healthcare',
        location: 'Boston, MA',
        description: 'Healthcare technology and services',
        company_size: '501-1000',
        user_id: DEFAULT_USER_ID
      }
    ];

    console.log('Adding companies...');
    const { data: insertedCompanies, error: companiesError } = await supabase
      .from('companies')
      .insert(companies)
      .select();
    
    if (companiesError) throw companiesError;

    // 2. Add job applications
    const applications = [
      {
        title: 'Senior Frontend Developer',
        status: 'interviewing',
        applied_date: new Date(2024, 9, 12).toISOString(),
        company_id: insertedCompanies[0].id,
        salary_range: '$120K - $150K',
        job_posting_url: 'https://techcorp.example.com/careers/123',
        description: 'Looking for an experienced frontend developer with Vue.js and React expertise.',
        user_id: DEFAULT_USER_ID
      },
      {
        title: 'Backend Engineer',
        status: 'applied',
        applied_date: new Date(2024, 9, 10).toISOString(),
        company_id: insertedCompanies[1].id,
        salary_range: '$110K - $130K',
        job_posting_url: 'https://datasystems.example.com/jobs/backend',
        description: 'Building scalable microservices with Node.js and PostgreSQL.',
        user_id: DEFAULT_USER_ID
      },
      {
        title: 'Full Stack Developer',
        status: 'offered',
        applied_date: new Date(2024, 9, 5).toISOString(),
        company_id: insertedCompanies[2].id,
        salary_range: '$130K - $160K',
        job_posting_url: 'https://innovate.example.com/careers',
        description: 'Working on cutting-edge web applications using modern tech stack.',
        user_id: DEFAULT_USER_ID
      },
      {
        title: 'UI/UX Designer',
        status: 'rejected',
        applied_date: new Date(2024, 9, 1).toISOString(),
        company_id: insertedCompanies[3].id,
        salary_range: '$90K - $110K',
        job_posting_url: 'https://creativedesigns.example.com/jobs/designer',
        description: 'Creating intuitive and beautiful user interfaces for web and mobile apps.',
        user_id: DEFAULT_USER_ID
      },
      {
        title: 'DevOps Engineer',
        status: 'applied',
        applied_date: new Date(2024, 8, 28).toISOString(),
        company_id: insertedCompanies[4].id,
        salary_range: '$125K - $145K',
        job_posting_url: 'https://cloudsystems.example.com/careers/devops',
        description: 'Managing cloud infrastructure and implementing CI/CD pipelines.',
        user_id: DEFAULT_USER_ID
      },
      {
        title: 'Product Manager',
        status: 'interviewing',
        applied_date: new Date(2024, 8, 25).toISOString(),
        company_id: insertedCompanies[0].id,
        salary_range: '$140K - $170K',
        job_posting_url: 'https://techcorp.example.com/careers/456',
        description: 'Leading product development and coordinating with engineering teams.',
        user_id: DEFAULT_USER_ID
      },
      {
        title: 'Data Scientist',
        status: 'applied',
        applied_date: new Date(2024, 8, 20).toISOString(),
        company_id: insertedCompanies[6].id,
        salary_range: '$135K - $165K',
        job_posting_url: 'https://healthcare-plus.example.com/jobs/data',
        description: 'Analyzing healthcare data and building predictive models.',
        user_id: DEFAULT_USER_ID
      }
    ];

    console.log('Adding job applications...');
    const { data: insertedApplications, error: applicationsError } = await supabase
      .from('job_applications')
      .insert(applications)
      .select();
    
    if (applicationsError) throw applicationsError;

    // 3. Add contacts
    const contacts = [
      {
        name: 'John Smith',
        title: 'Senior Recruiter',
        email: 'john.smith@techcorp.example.com',
        phone: '(555) 123-4567',
        company_id: insertedCompanies[0].id,
        notes: 'Initial contact for the Senior Frontend Developer position',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Sarah Johnson',
        title: 'HR Manager',
        email: 'sarah.j@datasystems.example.com',
        phone: '(555) 234-5678',
        company_id: insertedCompanies[1].id,
        notes: 'Conducted first interview for Backend Engineer role',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Michael Chen',
        title: 'CTO',
        email: 'michael@innovate.example.com',
        phone: '(555) 345-6789',
        company_id: insertedCompanies[2].id,
        notes: 'Technical interviewer for Full Stack position',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Emily Davis',
        title: 'Design Director',
        email: 'emily@creativedesigns.example.com',
        phone: '(555) 456-7890',
        company_id: insertedCompanies[3].id,
        notes: 'Reviewed portfolio during UI/UX interview',
        user_id: DEFAULT_USER_ID
      },
      {
        name: 'Robert Wilson',
        title: 'DevOps Lead',
        email: 'robert@cloudsystems.example.com',
        phone: '(555) 567-8901',
        company_id: insertedCompanies[4].id,
        notes: 'Discussed cloud infrastructure experience',
        user_id: DEFAULT_USER_ID
      }
    ];

    console.log('Adding contacts...');
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(contacts)
      .select();
    
    if (contactsError) throw contactsError;

    // 4. Add interviews
    const interviews = [
      {
        job_application_id: insertedApplications[0].id,
        interview_date: new Date(2024, 9, 15, 10, 0).toISOString(),
        interview_type: 'phone',
        contact_id: insertedContacts[0].id,
        notes: 'Initial screening call with recruiter',
        status: 'completed',
        user_id: DEFAULT_USER_ID
      },
      {
        job_application_id: insertedApplications[0].id,
        interview_date: new Date(2024, 9, 18, 14, 0).toISOString(),
        interview_type: 'video',
        notes: 'Technical interview with the engineering team',
        status: 'scheduled',
        user_id: DEFAULT_USER_ID
      },
      {
        job_application_id: insertedApplications[2].id,
        interview_date: new Date(2024, 9, 8, 11, 30).toISOString(),
        interview_type: 'video',
        contact_id: insertedContacts[2].id,
        notes: 'First round with the CTO',
        status: 'completed',
        user_id: DEFAULT_USER_ID
      },
      {
        job_application_id: insertedApplications[2].id,
        interview_date: new Date(2024, 9, 10, 15, 0).toISOString(),
        interview_type: 'onsite',
        notes: 'Final round with team and culture fit',
        status: 'completed',
        user_id: DEFAULT_USER_ID
      },
      {
        job_application_id: insertedApplications[5].id,
        interview_date: new Date(2024, 8, 30, 13, 0).toISOString(),
        interview_type: 'phone',
        contact_id: insertedContacts[0].id,
        notes: 'Initial discussion about the Product Manager role',
        status: 'completed',
        user_id: DEFAULT_USER_ID
      },
      {
        job_application_id: insertedApplications[5].id,
        interview_date: new Date(2024, 10, 5, 11, 0).toISOString(),
        interview_type: 'video',
        notes: 'Second round with product team',
        status: 'scheduled',
        user_id: DEFAULT_USER_ID
      }
    ];

    console.log('Adding interviews...');
    const { error: interviewsError } = await supabase
      .from('interviews')
      .insert(interviews);
    
    if (interviewsError) throw interviewsError;

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase(); 