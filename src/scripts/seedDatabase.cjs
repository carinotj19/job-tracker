// CommonJS version of the seed script
const { createClient } = require('@supabase/supabase-js');

// Create the Supabase client directly in this file
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // 1. Add companies first
    const companies = [
      {
        id: 'tc1',
        name: 'TechCorp Inc.',
        website: 'https://techcorp.example.com',
        industry: 'Technology',
        location: 'San Francisco, CA',
        description: 'Leading technology company specializing in AI and ML solutions',
        company_size: '501-1000'
      },
      {
        id: 'ds1',
        name: 'DataSystems Ltd',
        website: 'https://datasystems.example.com',
        industry: 'Software',
        location: 'Austin, TX',
        description: 'Enterprise data management solutions',
        company_size: '201-500'
      },
      {
        id: 'is1',
        name: 'Innovate Solutions',
        website: 'https://innovate.example.com',
        industry: 'Software Development',
        location: 'New York, NY',
        description: 'Custom software development and digital transformation',
        company_size: '51-200'
      },
      {
        id: 'cd1',
        name: 'Creative Designs',
        website: 'https://creativedesigns.example.com',
        industry: 'Design',
        location: 'Los Angeles, CA',
        description: 'UI/UX and graphic design agency',
        company_size: '11-50'
      },
      {
        id: 'cs1',
        name: 'Cloud Systems',
        website: 'https://cloudsystems.example.com',
        industry: 'Cloud Computing',
        location: 'Seattle, WA',
        description: 'Cloud infrastructure and DevOps solutions',
        company_size: '51-200'
      },
      {
        id: 'fs1',
        name: 'FinServ Inc',
        website: 'https://finserv.example.com',
        industry: 'Finance',
        location: 'Chicago, IL',
        description: 'Financial services and technology',
        company_size: '1001-5000'
      },
      {
        id: 'hc1',
        name: 'HealthCare Plus',
        website: 'https://healthcare-plus.example.com',
        industry: 'Healthcare',
        location: 'Boston, MA',
        description: 'Healthcare technology and services',
        company_size: '501-1000'
      }
    ];

    console.log('Adding companies...');
    const { error: companiesError } = await supabase.from('companies').upsert(companies);
    if (companiesError) throw companiesError;

    // 2. Add job applications
    const applications = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        status: 'interviewing',
        applied_date: new Date(2024, 9, 12).toISOString(),
        company_id: 'tc1',
        salary_range: '$120K - $150K',
        job_posting_url: 'https://techcorp.example.com/careers/123',
        description: 'Looking for an experienced frontend developer with Vue.js and React expertise.'
      },
      {
        id: '2',
        title: 'Backend Engineer',
        status: 'applied',
        applied_date: new Date(2024, 9, 10).toISOString(),
        company_id: 'ds1',
        salary_range: '$110K - $130K',
        job_posting_url: 'https://datasystems.example.com/jobs/backend',
        description: 'Building scalable microservices with Node.js and PostgreSQL.'
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        status: 'offered',
        applied_date: new Date(2024, 9, 5).toISOString(),
        company_id: 'is1',
        salary_range: '$130K - $160K',
        job_posting_url: 'https://innovate.example.com/careers',
        description: 'Working on cutting-edge web applications using modern tech stack.'
      },
      {
        id: '4',
        title: 'UI/UX Designer',
        status: 'rejected',
        applied_date: new Date(2024, 9, 1).toISOString(),
        company_id: 'cd1',
        salary_range: '$90K - $110K',
        job_posting_url: 'https://creativedesigns.example.com/jobs/designer',
        description: 'Creating intuitive and beautiful user interfaces for web and mobile apps.'
      },
      {
        id: '5',
        title: 'DevOps Engineer',
        status: 'applied',
        applied_date: new Date(2024, 8, 28).toISOString(),
        company_id: 'cs1',
        salary_range: '$125K - $145K',
        job_posting_url: 'https://cloudsystems.example.com/careers/devops',
        description: 'Managing cloud infrastructure and implementing CI/CD pipelines.'
      },
      {
        id: '6',
        title: 'Product Manager',
        status: 'interviewing',
        applied_date: new Date(2024, 8, 25).toISOString(),
        company_id: 'tc1',
        salary_range: '$140K - $170K',
        job_posting_url: 'https://techcorp.example.com/careers/456',
        description: 'Leading product development and coordinating with engineering teams.'
      },
      {
        id: '7',
        title: 'Data Scientist',
        status: 'applied',
        applied_date: new Date(2024, 8, 20).toISOString(),
        company_id: 'hc1',
        salary_range: '$135K - $165K',
        job_posting_url: 'https://healthcare-plus.example.com/jobs/data',
        description: 'Analyzing healthcare data and building predictive models.'
      }
    ];

    console.log('Adding job applications...');
    const { error: applicationsError } = await supabase.from('job_applications').upsert(applications);
    if (applicationsError) throw applicationsError;

    // 3. Add contacts
    const contacts = [
      {
        id: '1',
        name: 'John Smith',
        title: 'Senior Recruiter',
        email: 'john.smith@techcorp.example.com',
        phone: '(555) 123-4567',
        company_id: 'tc1',
        notes: 'Initial contact for the Senior Frontend Developer position'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        title: 'HR Manager',
        email: 'sarah.j@datasystems.example.com',
        phone: '(555) 234-5678',
        company_id: 'ds1',
        notes: 'Conducted first interview for Backend Engineer role'
      },
      {
        id: '3',
        name: 'Michael Chen',
        title: 'CTO',
        email: 'michael@innovate.example.com',
        phone: '(555) 345-6789',
        company_id: 'is1',
        notes: 'Technical interviewer for Full Stack position'
      },
      {
        id: '4',
        name: 'Emily Davis',
        title: 'Design Director',
        email: 'emily@creativedesigns.example.com',
        phone: '(555) 456-7890',
        company_id: 'cd1',
        notes: 'Reviewed portfolio during UI/UX interview'
      },
      {
        id: '5',
        name: 'Robert Wilson',
        title: 'DevOps Lead',
        email: 'robert@cloudsystems.example.com',
        phone: '(555) 567-8901',
        company_id: 'cs1',
        notes: 'Discussed cloud infrastructure experience'
      }
    ];

    console.log('Adding contacts...');
    const { error: contactsError } = await supabase.from('contacts').upsert(contacts);
    if (contactsError) throw contactsError;

    // 4. Add interviews
    const interviews = [
      {
        id: '1',
        job_application_id: '1',
        interview_date: new Date(2024, 9, 15, 10, 0).toISOString(),
        interview_type: 'phone',
        contact_id: '1',
        notes: 'Initial screening call with recruiter',
        status: 'completed'
      },
      {
        id: '2',
        job_application_id: '1',
        interview_date: new Date(2024, 9, 18, 14, 0).toISOString(),
        interview_type: 'video',
        notes: 'Technical interview with the engineering team',
        status: 'scheduled'
      },
      {
        id: '3',
        job_application_id: '3',
        interview_date: new Date(2024, 9, 8, 11, 30).toISOString(),
        interview_type: 'video',
        contact_id: '3',
        notes: 'First round with the CTO',
        status: 'completed'
      },
      {
        id: '4',
        job_application_id: '3',
        interview_date: new Date(2024, 9, 10, 15, 0).toISOString(),
        interview_type: 'onsite',
        notes: 'Final round with team and culture fit',
        status: 'completed'
      },
      {
        id: '5',
        job_application_id: '6',
        interview_date: new Date(2024, 8, 30, 13, 0).toISOString(),
        interview_type: 'phone',
        contact_id: '1',
        notes: 'Initial discussion about the Product Manager role',
        status: 'completed'
      },
      {
        id: '6',
        job_application_id: '6',
        interview_date: new Date(2024, 10, 5, 11, 0).toISOString(),
        interview_type: 'video',
        notes: 'Second round with product team',
        status: 'scheduled'
      }
    ];

    console.log('Adding interviews...');
    const { error: interviewsError } = await supabase.from('interviews').upsert(interviews);
    if (interviewsError) throw interviewsError;

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase(); 