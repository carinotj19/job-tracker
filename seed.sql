-- Companies
INSERT INTO companies (id, name, website, industry, location, description, company_size, created_at, user_id)
VALUES
  ('tc1', 'TechCorp Inc.', 'https://techcorp.example.com', 'Technology', 'San Francisco, CA', 'Leading technology company specializing in AI and ML solutions', '501-1000', NOW(), auth.uid()),
  ('ds1', 'DataSystems Ltd', 'https://datasystems.example.com', 'Software', 'Austin, TX', 'Enterprise data management solutions', '201-500', NOW(), auth.uid()),
  ('is1', 'Innovate Solutions', 'https://innovate.example.com', 'Software Development', 'New York, NY', 'Custom software development and digital transformation', '51-200', NOW(), auth.uid()),
  ('cd1', 'Creative Designs', 'https://creativedesigns.example.com', 'Design', 'Los Angeles, CA', 'UI/UX and graphic design agency', '11-50', NOW(), auth.uid()),
  ('cs1', 'Cloud Systems', 'https://cloudsystems.example.com', 'Cloud Computing', 'Seattle, WA', 'Cloud infrastructure and DevOps solutions', '51-200', NOW(), auth.uid()),
  ('fs1', 'FinServ Inc', 'https://finserv.example.com', 'Finance', 'Chicago, IL', 'Financial services and technology', '1001-5000', NOW(), auth.uid()),
  ('hc1', 'HealthCare Plus', 'https://healthcare-plus.example.com', 'Healthcare', 'Boston, MA', 'Healthcare technology and services', '501-1000', NOW(), auth.uid())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website,
  industry = EXCLUDED.industry,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  company_size = EXCLUDED.company_size;

-- Job Applications
INSERT INTO job_applications (id, title, status, applied_date, company_id, salary_range, job_posting_url, description, created_at, updated_at, user_id)
VALUES
  ('1', 'Senior Frontend Developer', 'interviewing', '2024-10-12', 'tc1', '$120K - $150K', 'https://techcorp.example.com/careers/123', 'Looking for an experienced frontend developer with Vue.js and React expertise.', NOW(), NOW(), auth.uid()),
  ('2', 'Backend Engineer', 'applied', '2024-10-10', 'ds1', '$110K - $130K', 'https://datasystems.example.com/jobs/backend', 'Building scalable microservices with Node.js and PostgreSQL.', NOW(), NOW(), auth.uid()),
  ('3', 'Full Stack Developer', 'offered', '2024-10-05', 'is1', '$130K - $160K', 'https://innovate.example.com/careers', 'Working on cutting-edge web applications using modern tech stack.', NOW(), NOW(), auth.uid()),
  ('4', 'UI/UX Designer', 'rejected', '2024-10-01', 'cd1', '$90K - $110K', 'https://creativedesigns.example.com/jobs/designer', 'Creating intuitive and beautiful user interfaces for web and mobile apps.', NOW(), NOW(), auth.uid()),
  ('5', 'DevOps Engineer', 'applied', '2024-09-28', 'cs1', '$125K - $145K', 'https://cloudsystems.example.com/careers/devops', 'Managing cloud infrastructure and implementing CI/CD pipelines.', NOW(), NOW(), auth.uid()),
  ('6', 'Product Manager', 'interviewing', '2024-09-25', 'tc1', '$140K - $170K', 'https://techcorp.example.com/careers/456', 'Leading product development and coordinating with engineering teams.', NOW(), NOW(), auth.uid()),
  ('7', 'Data Scientist', 'applied', '2024-09-20', 'hc1', '$135K - $165K', 'https://healthcare-plus.example.com/jobs/data', 'Analyzing healthcare data and building predictive models.', NOW(), NOW(), auth.uid())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  applied_date = EXCLUDED.applied_date,
  company_id = EXCLUDED.company_id,
  salary_range = EXCLUDED.salary_range,
  job_posting_url = EXCLUDED.job_posting_url,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Contacts
INSERT INTO contacts (id, name, title, email, phone, company_id, notes, created_at, user_id)
VALUES
  ('1', 'John Smith', 'Senior Recruiter', 'john.smith@techcorp.example.com', '(555) 123-4567', 'tc1', 'Initial contact for the Senior Frontend Developer position', NOW(), auth.uid()),
  ('2', 'Sarah Johnson', 'HR Manager', 'sarah.j@datasystems.example.com', '(555) 234-5678', 'ds1', 'Conducted first interview for Backend Engineer role', NOW(), auth.uid()),
  ('3', 'Michael Chen', 'CTO', 'michael@innovate.example.com', '(555) 345-6789', 'is1', 'Technical interviewer for Full Stack position', NOW(), auth.uid()),
  ('4', 'Emily Davis', 'Design Director', 'emily@creativedesigns.example.com', '(555) 456-7890', 'cd1', 'Reviewed portfolio during UI/UX interview', NOW(), auth.uid()),
  ('5', 'Robert Wilson', 'DevOps Lead', 'robert@cloudsystems.example.com', '(555) 567-8901', 'cs1', 'Discussed cloud infrastructure experience', NOW(), auth.uid())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  company_id = EXCLUDED.company_id,
  notes = EXCLUDED.notes;

-- Interviews
INSERT INTO interviews (id, job_application_id, interview_date, interview_type, contact_id, notes, status, created_at, user_id)
VALUES
  ('1', '1', '2024-10-15 10:00:00', 'phone', '1', 'Initial screening call with recruiter', 'completed', NOW(), auth.uid()),
  ('2', '1', '2024-10-18 14:00:00', 'video', NULL, 'Technical interview with the engineering team', 'scheduled', NOW(), auth.uid()),
  ('3', '3', '2024-10-08 11:30:00', 'video', '3', 'First round with the CTO', 'completed', NOW(), auth.uid()),
  ('4', '3', '2024-10-10 15:00:00', 'onsite', NULL, 'Final round with team and culture fit', 'completed', NOW(), auth.uid()),
  ('5', '6', '2024-09-30 13:00:00', 'phone', '1', 'Initial discussion about the Product Manager role', 'completed', NOW(), auth.uid()),
  ('6', '6', '2024-11-05 11:00:00', 'video', NULL, 'Second round with product team', 'scheduled', NOW(), auth.uid())
ON CONFLICT (id) DO UPDATE SET
  job_application_id = EXCLUDED.job_application_id,
  interview_date = EXCLUDED.interview_date,
  interview_type = EXCLUDED.interview_type,
  contact_id = EXCLUDED.contact_id,
  notes = EXCLUDED.notes,
  status = EXCLUDED.status; 