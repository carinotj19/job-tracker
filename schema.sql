-- Create tables with RLS (Row Level Security) enabled

-- Create a table for companies
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    location TEXT,
    description TEXT,
    company_size TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create a table for contacts
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create a table for job applications
CREATE TABLE job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied',
    salary_range TEXT,
    job_posting_url TEXT,
    description TEXT,
    notes TEXT,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create a table for interviews
CREATE TABLE interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    interview_type TEXT NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Companies policies
CREATE POLICY "Users can view their own companies"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for seeding
CREATE POLICY "Service role can bypass RLS"
    ON companies FOR ALL
    USING (auth.role() = 'service_role');

-- Contacts policies
CREATE POLICY "Users can view their own contacts"
    ON contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
    ON contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
    ON contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
    ON contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for seeding
CREATE POLICY "Service role can bypass RLS"
    ON contacts FOR ALL
    USING (auth.role() = 'service_role');

-- Job applications policies
CREATE POLICY "Users can view their own applications"
    ON job_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
    ON job_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
    ON job_applications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
    ON job_applications FOR DELETE
    USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for seeding
CREATE POLICY "Service role can bypass RLS"
    ON job_applications FOR ALL
    USING (auth.role() = 'service_role');

-- Interviews policies
CREATE POLICY "Users can view their own interviews"
    ON interviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews"
    ON interviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews"
    ON interviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews"
    ON interviews FOR DELETE
    USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for seeding
CREATE POLICY "Service role can bypass RLS"
    ON interviews FOR ALL
    USING (auth.role() = 'service_role'); 