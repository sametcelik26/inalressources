

## Plan: Redesign Homepage + Create Employer & Candidate Form Pages

### Overview
Redesign the homepage hero to feature two prominent buttons ("For Employers" / "For Candidates") with the tagline "Connecting Employers With The Right Talent". Create two new form pages with card-style layouts, icons, validation, and database storage. Full EN/FR support.

### 1. Database Migration
Create an `employer_requests` table to store employer form submissions:
- `company_name`, `contact_person`, `company_address`, `phone`, `email`, `job_title`, `industry`, `employees_needed` (int), `preferred_contact`, `comments`
- RLS: public INSERT, admin-only SELECT

Create a `candidate_applications` table:
- `full_name`, `phone`, `email`, `availability`, `license_class`, `industry`, `work_location`, `legal_right_to_work` (boolean), `cv_url`, `preferred_contact`, `comments`
- RLS: public INSERT, admin-only SELECT

### 2. Update `HeroSection.tsx`
- Replace current two buttons with "For Employers" → `/employers` and "For Candidates" → `/candidates`
- Update tagline to "Connecting Employers With The Right Talent"
- Keep gradient background, add icons (Building2, Users)

### 3. Create `src/pages/EmployerForm.tsx`
- Card-style form with all specified fields
- Dropdowns for Industry and Preferred Contact Method
- Zod validation, react-hook-form
- Icons next to field labels
- Submit to `employer_requests` table
- Success state with CheckCircle

### 4. Create `src/pages/CandidateForm.tsx`
- Card-style form with all specified fields
- Dropdowns for License Class, Industry, Work Location, Availability, Preferred Contact
- File upload for CV (using Supabase storage bucket)
- Required field markers (*)
- Zod validation, react-hook-form
- Submit to `candidate_applications` table
- Success state

### 5. Update `App.tsx`
- Add routes: `/employers`, `/candidates`

### 6. Update `LanguageContext.tsx`
- Add all EN/FR translations for both form pages (labels, placeholders, dropdown options, success/error messages)

### 7. Update `NavBar.tsx`
- Add links for "For Employers" and "For Candidates" in navigation

