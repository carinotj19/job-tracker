# Smart Job-Tracker

## Description
Smart Job-Tracker is a web application that helps job seekers organize and manage their job search process. It tracks applications, interviews, contacts, and companies in one centralized platform.

## Features
- Track job applications and their statuses
- Manage company information and contacts
- Schedule and monitor interviews
- View insights and analytics on your job search progress
- Secure authentication with role-based access control
- Offline support with service worker integration

## Tech Stack
- **Frontend**: Vue 3, TypeScript, Vite
- **UI**: PrimeVue, Tailwind CSS
- **State Management**: Pinia
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with Vue-ChartJS
- **Form Validation**: Vuelidate

## Installation
1. Clone the repository
   ```
   git clone https://github.com/carinotj19/smart-job-tracker.git
   cd smart-job-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Usage
1. Register or log in to your account
2. Add companies you're interested in
3. Create job applications linked to companies
4. Track interviews and contacts
5. Visit the Insights page to view statistics about your job search

## Configuration
Environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## API Reference
The application uses Supabase's built-in API endpoints for database operations:

- GET `/rest/v1/job_applications`: Retrieve job applications
- POST `/rest/v1/job_applications`: Create a new job application
- PUT `/rest/v1/job_applications`: Update a job application
- DELETE `/rest/v1/job_applications`: Delete a job application

Similar endpoints exist for companies, contacts, and interviews tables.

## Testing
Run the test suite with:
```
npm test
```

Tests are organized by feature and can be found in the `tests` directory.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.