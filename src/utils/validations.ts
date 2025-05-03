import { required, email, minLength, maxLength, url, helpers } from '@vuelidate/validators'

// Common validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must not exceed ${max} characters`,
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
  date: 'Please enter a valid date',
  salary: 'Please enter a valid salary range'
}

// Common validation rules
export const commonRules = {
  required: helpers.withMessage(validationMessages.required, required),
  email: helpers.withMessage(validationMessages.email, email),
  minLength: (min: number) => helpers.withMessage(validationMessages.minLength(min), minLength(min)),
  maxLength: (max: number) => helpers.withMessage(validationMessages.maxLength(max), maxLength(max)),
  url: helpers.withMessage(validationMessages.url, url)
}

// Application form validation rules
export const applicationRules = {
  title: {
    required: commonRules.required,
    minLength: commonRules.minLength(3),
    maxLength: commonRules.maxLength(100)
  },
  company: {
    required: commonRules.required
  },
  status: {
    required: commonRules.required
  },
  applied_date: {
    required: commonRules.required
  },
  job_posting_url: {
    url: commonRules.url
  },
  salary_range: {
    required: commonRules.required,
    pattern: helpers.withMessage(
      validationMessages.salary,
      helpers.regex(/^\$?\d+K?\s*-\s*\$?\d+K?$/)
    )
  },
  description: {
    required: helpers.withMessage(
      'Job description is required',
      required
    ),
    minLength: helpers.withMessage(
      validationMessages.minLength(10),
      minLength(10)
    )
  },
  notes: {
    maxLength: helpers.withMessage(
      validationMessages.maxLength(500),
      maxLength(500)
    )
  }
}

// Company form validation rules
export const companyRules = {
  name: {
    required: commonRules.required,
    minLength: commonRules.minLength(2),
    maxLength: commonRules.maxLength(100)
  },
  website: {
    url: commonRules.url
  },
  industry: {
    required: commonRules.required,
    minLength: commonRules.minLength(2),
    maxLength: commonRules.maxLength(50)
  },
  location: {
    required: commonRules.required,
    minLength: commonRules.minLength(2),
    maxLength: commonRules.maxLength(100)
  },
  company_size: {
    required: commonRules.required
  }
}

// Contact form validation rules
export const contactRules = {
  name: {
    required: commonRules.required,
    minLength: commonRules.minLength(2),
    maxLength: commonRules.maxLength(100)
  },
  email: {
    required: commonRules.required,
    email: commonRules.email
  },
  phone: {
    pattern: helpers.withMessage(
      validationMessages.phone,
      helpers.regex(/^\+?[\d\s-()]{10,}$/)
    )
  },
  title: {
    required: commonRules.required,
    minLength: commonRules.minLength(2),
    maxLength: commonRules.maxLength(100)
  },
  company_id: {
    required: commonRules.required
  }
}

// Interview form validation rules
export const interviewRules = {
  job_application_id: {
    required: commonRules.required
  },
  interview_date: {
    required: commonRules.required
  },
  interview_type: {
    required: commonRules.required
  },
  status: {
    required: commonRules.required
  }
}

// Helper function to get validation state
export function getValidationState(v$: any, field: string) {
  if (!v$ || !v$[field]) return ''
  return v$[field].$error ? 'p-invalid' : ''
}

// Helper function to get validation message
export function getValidationMessage(v$: any, field: string) {
  if (!v$ || !v$[field] || !v$[field].$errors || v$[field].$errors.length === 0) return ''
  return v$[field].$errors[0].$message
} 