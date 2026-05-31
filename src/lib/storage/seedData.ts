/**
 * Seed Data
 *
 * Creates sample templates in localStorage if none exist.
 * Called from StorageHydration after detecting an empty store.
 */

import type { FormTemplate } from '@/entities/template'
import { localStorageAdapter as storageAdapter } from './localStorage.adapter'

function iso(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString()
}

// ─────────────────────────────────────────────────────────────────────────────
// Template definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "Kitchen Sink" template — uses every single field type to exercise the full
 * builder and fill mode. Includes a conditional field and a calculation field.
 *
 * Field inventory:
 *  1. section-header           — "Personal Info" heading (lg)
 *  2. single-line              — Full Name (prefix + min/maxLength)
 *  3. multi-line               — Bio (rows, min/maxLength)
 *  4. number                   — Age (min, max, suffix)
 *  5. date                     — Date of Birth (min/maxDate, no prefill)
 *  6. single-select (radio)    — Employment Status
 *  7. section-header           — "Experience" heading (lg)
 *  8. single-select (dropdown) — Years of Experience
 *  9. single-select (tiles)    — Preferred Work Style
 * 10. multi-select             — Technical Skills (min/maxSelections)
 * 11. single-line (conditional)— Other Skills — shown only when "Other" is checked
 * 12. section-header           — "Logistics" heading (lg)
 * 13. file-upload              — Resume / CV (.pdf,.doc,.docx, max 1)
 * 14. number                   — Expected Salary (prefix $, suffix USD)
 * 15. number                   — Signing Bonus Ask (prefix $, suffix USD)
 * 16. calculation              — Total Comp = sum(salary + bonus)
 */
const KITCHEN_SINK: FormTemplate = {
  id: 'seed-tpl-kitchen-sink',
  title: 'Field Type Showcase',
  description: 'Uses every field type — great for testing builder and fill mode end-to-end.',
  fieldIds: [
    'ks-hdr-personal',
    'ks-name',
    'ks-bio',
    'ks-age',
    'ks-dob',
    'ks-employment',
    'ks-hdr-experience',
    'ks-years',
    'ks-work-style',
    'ks-skills',
    'ks-other-skills',
    'ks-hdr-logistics',
    'ks-resume',
    'ks-salary',
    'ks-bonus',
    'ks-total-comp',
  ],
  fields: {
    'ks-hdr-personal': {
      id: 'ks-hdr-personal',
      type: 'section-header',
      label: 'Personal Information',
      size: 'lg',
      order: 0,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-name': {
      id: 'ks-name',
      type: 'single-line',
      label: 'Full Name',
      placeholder: 'Jane Smith',
      prefix: '👤',
      minLength: 2,
      maxLength: 80,
      order: 1,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ks-bio': {
      id: 'ks-bio',
      type: 'multi-line',
      label: 'Short Bio',
      placeholder: 'Tell us a little about yourself…',
      rows: 4,
      minLength: 20,
      maxLength: 500,
      order: 2,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-age': {
      id: 'ks-age',
      type: 'number',
      label: 'Age',
      min: 16,
      max: 100,
      decimalPlaces: 0,
      suffix: 'yrs',
      order: 3,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ks-dob': {
      id: 'ks-dob',
      type: 'date',
      label: 'Date of Birth',
      prefillToday: false,
      minDate: '1924-01-01',
      maxDate: '2008-12-31',
      order: 4,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-employment': {
      id: 'ks-employment',
      type: 'single-select',
      label: 'Employment Status',
      displayType: 'radio',
      options: [
        { id: 'emp-full',    label: 'Full-time employed' },
        { id: 'emp-part',    label: 'Part-time employed' },
        { id: 'emp-self',    label: 'Self-employed / Freelance' },
        { id: 'emp-student', label: 'Student' },
        { id: 'emp-none',    label: 'Not currently employed' },
      ],
      order: 5,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ks-hdr-experience': {
      id: 'ks-hdr-experience',
      type: 'section-header',
      label: 'Experience & Skills',
      size: 'lg',
      order: 6,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-years': {
      id: 'ks-years',
      type: 'single-select',
      label: 'Years of Experience',
      displayType: 'dropdown',
      options: [
        { id: 'yr-0',  label: '0–1 years' },
        { id: 'yr-2',  label: '2–4 years' },
        { id: 'yr-5',  label: '5–9 years' },
        { id: 'yr-10', label: '10+ years' },
      ],
      order: 7,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ks-work-style': {
      id: 'ks-work-style',
      type: 'single-select',
      label: 'Preferred Work Style',
      displayType: 'tiles',
      options: [
        { id: 'ws-remote', label: 'Remote' },
        { id: 'ws-hybrid', label: 'Hybrid' },
        { id: 'ws-office', label: 'On-site' },
      ],
      order: 8,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ks-skills': {
      id: 'ks-skills',
      type: 'multi-select',
      label: 'Technical Skills',
      options: [
        { id: 'sk-js',    label: 'JavaScript / TypeScript' },
        { id: 'sk-py',    label: 'Python' },
        { id: 'sk-go',    label: 'Go' },
        { id: 'sk-rust',  label: 'Rust' },
        { id: 'sk-sql',   label: 'SQL / Databases' },
        { id: 'sk-cloud', label: 'Cloud / DevOps' },
        { id: 'sk-other', label: 'Other (specify below)' },
      ],
      minSelections: 1,
      maxSelections: 5,
      order: 9,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    // Conditional field — visible only when "Other" skill is selected
    'ks-other-skills': {
      id: 'ks-other-skills',
      type: 'single-line',
      label: 'Other Skills (specify)',
      placeholder: 'Describe your other technical skills…',
      order: 10,
      conditions: [
        {
          targetFieldId: 'ks-skills',
          operator: 'contains-any',
          value: ['sk-other'],
          effect: 'show',
        },
      ],
      defaultVisibility: 'hidden',
      defaultRequired: false,
    },
    'ks-hdr-logistics': {
      id: 'ks-hdr-logistics',
      type: 'section-header',
      label: 'Compensation & Documents',
      size: 'lg',
      order: 11,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-resume': {
      id: 'ks-resume',
      type: 'file-upload',
      label: 'Resume / CV',
      allowedTypes: '.pdf,.doc,.docx',
      maxFiles: 1,
      order: 12,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-salary': {
      id: 'ks-salary',
      type: 'number',
      label: 'Expected Annual Salary',
      min: 0,
      decimalPlaces: 0,
      prefix: '$',
      suffix: 'USD',
      order: 13,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-bonus': {
      id: 'ks-bonus',
      type: 'number',
      label: 'Signing Bonus Ask',
      min: 0,
      decimalPlaces: 0,
      prefix: '$',
      suffix: 'USD',
      order: 14,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ks-total-comp': {
      id: 'ks-total-comp',
      type: 'calculation',
      label: 'Total Compensation (auto-calculated)',
      sourceFieldIds: ['ks-salary', 'ks-bonus'],
      aggregation: 'sum',
      decimalPlaces: 0,
      order: 15,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
  },
  createdAt: iso(0),
  updatedAt: iso(0),
  responseCount: 0,
}

const CUSTOMER_FEEDBACK: FormTemplate = {
  id: 'seed-tpl-feedback',
  title: 'Customer Feedback Survey',
  description: 'Help us improve by sharing your experience.',
  fieldIds: ['fb-name', 'fb-email', 'fb-rating', 'fb-comment', 'fb-score'],
  fields: {
    'fb-name': {
      id: 'fb-name',
      type: 'single-line',
      label: 'Your Name',
      placeholder: 'Jane Smith',
      order: 0,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'fb-email': {
      id: 'fb-email',
      type: 'single-line',
      label: 'Email Address',
      placeholder: 'jane@example.com',
      order: 1,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'fb-rating': {
      id: 'fb-rating',
      type: 'single-select',
      label: 'Overall Rating',
      displayType: 'tiles',
      options: [
        { id: 'r1', label: '1 — Poor' },
        { id: 'r2', label: '2 — Fair' },
        { id: 'r3', label: '3 — Good' },
        { id: 'r4', label: '4 — Great' },
        { id: 'r5', label: '5 — Excellent' },
      ],
      order: 2,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'fb-comment': {
      id: 'fb-comment',
      type: 'multi-line',
      label: 'Additional Comments',
      placeholder: 'Tell us more about your experience…',
      rows: 4,
      order: 3,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'fb-score': {
      id: 'fb-score',
      type: 'number',
      label: 'Net Promoter Score (0–10)',
      min: 0,
      max: 10,
      decimalPlaces: 0,
      order: 4,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
  },
  createdAt: iso(14),
  updatedAt: iso(2),
  responseCount: 3,
}

const ONBOARDING_FORM: FormTemplate = {
  id: 'seed-tpl-onboarding',
  title: 'Employee Onboarding Form',
  description: 'Complete this form during your first week.',
  fieldIds: ['ob-header', 'ob-fullname', 'ob-startdate', 'ob-department', 'ob-equipment', 'ob-notes'],
  fields: {
    'ob-header': {
      id: 'ob-header',
      type: 'section-header',
      label: 'Personal Information',
      size: 'md',
      order: 0,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ob-fullname': {
      id: 'ob-fullname',
      type: 'single-line',
      label: 'Full Legal Name',
      placeholder: 'As it appears on your ID',
      order: 1,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ob-startdate': {
      id: 'ob-startdate',
      type: 'date',
      label: 'Start Date',
      prefillToday: true,
      order: 2,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ob-department': {
      id: 'ob-department',
      type: 'single-select',
      label: 'Department',
      displayType: 'dropdown',
      options: [
        { id: 'eng',    label: 'Engineering' },
        { id: 'design', label: 'Design' },
        { id: 'pm',     label: 'Product' },
        { id: 'sales',  label: 'Sales' },
        { id: 'hr',     label: 'HR' },
        { id: 'ops',    label: 'Operations' },
      ],
      order: 3,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ob-equipment': {
      id: 'ob-equipment',
      type: 'multi-select',
      label: 'Equipment Needed',
      options: [
        { id: 'laptop',   label: 'Laptop' },
        { id: 'monitor',  label: 'External Monitor' },
        { id: 'keyboard', label: 'Keyboard & Mouse' },
        { id: 'headset',  label: 'Headset' },
        { id: 'phone',    label: 'Work Phone' },
      ],
      order: 4,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ob-notes': {
      id: 'ob-notes',
      type: 'multi-line',
      label: 'Additional Notes',
      placeholder: 'Anything else we should know?',
      rows: 3,
      order: 5,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
  },
  createdAt: iso(30),
  updatedAt: iso(5),
  responseCount: 12,
}

const BUG_REPORT: FormTemplate = {
  id: 'seed-tpl-bugreport',
  title: 'Bug Report Form',
  description: 'Report a software defect to the engineering team.',
  fieldIds: ['bug-title', 'bug-severity', 'bug-steps', 'bug-expected', 'bug-actual'],
  fields: {
    'bug-title': {
      id: 'bug-title',
      type: 'single-line',
      label: 'Bug Title',
      placeholder: 'Short description of the issue',
      order: 0,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'bug-severity': {
      id: 'bug-severity',
      type: 'single-select',
      label: 'Severity',
      displayType: 'radio',
      options: [
        { id: 'low',  label: 'Low — Minor inconvenience' },
        { id: 'med',  label: 'Medium — Feature broken' },
        { id: 'high', label: 'High — Core workflow broken' },
        { id: 'crit', label: 'Critical — Data loss / crash' },
      ],
      order: 1,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'bug-steps': {
      id: 'bug-steps',
      type: 'multi-line',
      label: 'Steps to Reproduce',
      placeholder: '1. Go to…\n2. Click on…\n3. Observe…',
      rows: 5,
      order: 2,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'bug-expected': {
      id: 'bug-expected',
      type: 'single-line',
      label: 'Expected Behaviour',
      placeholder: 'What should have happened?',
      order: 3,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'bug-actual': {
      id: 'bug-actual',
      type: 'single-line',
      label: 'Actual Behaviour',
      placeholder: 'What actually happened?',
      order: 4,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
  },
  createdAt: iso(7),
  updatedAt: iso(1),
  responseCount: 7,
}

const EVENT_REGISTRATION: FormTemplate = {
  id: 'seed-tpl-event',
  title: 'Event Registration',
  description: 'Register for the upcoming company all-hands meeting.',
  fieldIds: ['ev-name', 'ev-date', 'ev-session', 'ev-dietary', 'ev-attend'],
  fields: {
    'ev-name': {
      id: 'ev-name',
      type: 'single-line',
      label: 'Attendee Name',
      placeholder: 'Your full name',
      order: 0,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ev-date': {
      id: 'ev-date',
      type: 'date',
      label: 'Preferred Date',
      prefillToday: false,
      minDate: '2025-01-01',
      order: 1,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ev-session': {
      id: 'ev-session',
      type: 'single-select',
      label: 'Session Preference',
      displayType: 'radio',
      options: [
        { id: 'morning',   label: 'Morning (9am–12pm)' },
        { id: 'afternoon', label: 'Afternoon (1pm–5pm)' },
        { id: 'full',      label: 'Full Day' },
      ],
      order: 2,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true,
    },
    'ev-dietary': {
      id: 'ev-dietary',
      type: 'multi-select',
      label: 'Dietary Requirements',
      options: [
        { id: 'veg',    label: 'Vegetarian' },
        { id: 'vegan',  label: 'Vegan' },
        { id: 'gf',     label: 'Gluten-free' },
        { id: 'halal',  label: 'Halal' },
        { id: 'kosher', label: 'Kosher' },
        { id: 'none',   label: 'No restrictions' },
      ],
      order: 3,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
    'ev-attend': {
      id: 'ev-attend',
      type: 'number',
      label: 'Number of Guests',
      min: 0,
      max: 5,
      decimalPlaces: 0,
      order: 4,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: false,
    },
  },
  createdAt: iso(3),
  updatedAt: iso(0),
  responseCount: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

const SEED_TEMPLATES: FormTemplate[] = [
  KITCHEN_SINK,
  CUSTOMER_FEEDBACK,
  ONBOARDING_FORM,
  BUG_REPORT,
  EVENT_REGISTRATION,
]

/**
 * Seed default templates into localStorage if the store is empty.
 * Also backfills the kitchen-sink template for existing installs that
 * don't have it yet (checked by ID).
 */
export async function seedDefaultTemplates(): Promise<FormTemplate[]> {
  const existing = await storageAdapter.getTemplates()

  if (existing.length === 0) {
    for (const template of SEED_TEMPLATES) {
      await storageAdapter.saveTemplate(template)
    }
    return SEED_TEMPLATES
  }

  // Existing install — add kitchen-sink if missing
  const hasKitchenSink = existing.some((t) => t.id === KITCHEN_SINK.id)
  if (!hasKitchenSink) {
    await storageAdapter.saveTemplate(KITCHEN_SINK)
  }

  return []
}
