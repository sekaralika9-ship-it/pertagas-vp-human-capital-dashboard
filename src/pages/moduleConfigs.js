import { employeeService } from '../services/employeeService';
import { tnaService } from '../services/tnaService';
import { budgetService } from '../services/budgetService';
import { trainingService } from '../services/trainingService';
import { competencyService } from '../services/competencyService';
import { auditService } from '../services/auditService';
import { documentService } from '../services/documentService';
import { calculateCompetencyGap } from '../lib/calculations';

const notes = { name: 'notes', label: 'Notes', type: 'textarea', full: true };
const date = (name, label, required = false) => ({ name, label, type: 'date', required });
const number = (name, label, required = false, min = 0, max) => ({ name, label, type: 'number', required, min, max });
const select = (name, label, options, required = false) => ({ name, label, options, required });

export const employeeConfig = {
  title: 'Employees', singular: 'employee', service: employeeService,
  description: 'Maintain the workforce master data used throughout HC operations.',
  empty: 'No employee records have been added. Add your first employee to begin.',
  search: ['employee_number', 'full_name', 'email', 'function', 'department'],
  fields: [
    { name: 'employee_number', label: 'Employee Number', required: true },
    { name: 'full_name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'function', label: 'Function', required: true },
    { name: 'department', label: 'Department' }, { name: 'position', label: 'Position' },
    { name: 'grade', label: 'Grade' },
    select('employment_status', 'Employment Status', ['active', 'inactive', 'retired', 'secondment'], true),
    date('join_date', 'Join Date'), { name: 'location', label: 'Location' }, notes,
  ],
  columns: [
    { key: 'employee_number', label: 'Employee No.' }, { key: 'full_name', label: 'Full Name' },
    { key: 'function', label: 'Function' }, { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' }, { key: 'employment_status', label: 'Status', kind: 'status' },
  ],
};

export const tnaConfig = {
  title: 'Training Needs Analysis', singular: 'TNA record', service: tnaService,
  description: 'Plan competency needs and monitor approval and completion progress.',
  empty: 'No TNA records have been added. Add your first training need to begin.',
  search: ['function', 'department', 'competency_category', 'proposed_training'],
  fields: [
    number('year', 'Year', true, 2000, 2100), { name: 'function', label: 'Function', required: true },
    { name: 'department', label: 'Department' }, { name: 'competency_category', label: 'Competency Category', required: true },
    { name: 'competency_gap', label: 'Competency Gap', type: 'textarea', full: true, required: true },
    { name: 'proposed_training', label: 'Proposed Training', required: true },
    select('priority', 'Priority', ['low', 'medium', 'high', 'critical'], true),
    number('participant_count', 'Participant Count', true), date('target_completion_date', 'Target Completion Date'),
    select('status', 'Status', ['draft', 'proposed', 'approved', 'in_progress', 'completed', 'cancelled'], true), notes,
  ],
  columns: [
    { key: 'year', label: 'Year' }, { key: 'function', label: 'Function' },
    { key: 'competency_category', label: 'Category' }, { key: 'proposed_training', label: 'Proposed Training' },
    { key: 'priority', label: 'Priority', kind: 'status' }, { key: 'participant_count', label: 'Participants' },
    { key: 'status', label: 'Status', kind: 'status' },
  ],
};

export const budgetConfig = {
  title: 'Budget', singular: 'budget record', service: budgetService,
  description: 'Track allocated, committed, and used HC programme funds.',
  empty: 'No budget records have been entered.',
  search: ['budget_category', 'cost_centre', 'programme_name'],
  fields: [
    number('year', 'Year', true, 2000, 2100), { name: 'budget_category', label: 'Budget Category', required: true },
    { name: 'cost_centre', label: 'Cost Centre', required: true }, { name: 'programme_name', label: 'Programme Name', required: true },
    number('allocated_amount', 'Allocated Amount', true), number('used_amount', 'Used Amount', true),
    number('committed_amount', 'Committed Amount', true), { name: 'remaining_amount', label: 'Remaining Amount', type: 'number', computed: true },
    { name: 'currency', label: 'Currency', defaultValue: 'IDR', required: true }, notes,
  ],
  columns: [
    { key: 'year', label: 'Year' }, { key: 'programme_name', label: 'Programme' }, { key: 'budget_category', label: 'Category' },
    { key: 'allocated_amount', label: 'Allocated', kind: 'currency' }, { key: 'used_amount', label: 'Used', kind: 'currency' },
    { key: 'committed_amount', label: 'Committed', kind: 'currency' }, { key: 'remaining_amount', label: 'Remaining', kind: 'currency' },
  ],
};

export const trainingConfig = {
  title: 'Training Realization', singular: 'training record', service: trainingService,
  description: 'Record delivery, participation, completion, and actual programme cost.',
  empty: 'No training records are available for the selected period.',
  search: ['training_title', 'category', 'provider'],
  fields: [
    { name: 'training_title', label: 'Training Title', required: true }, { name: 'category', label: 'Category', required: true },
    { name: 'provider', label: 'Provider' },
    select('training_method', 'Training Method', ['classroom', 'online', 'blended', 'coaching', 'certification', 'workshop', 'seminar'], true),
    date('start_date', 'Start Date', true), date('end_date', 'End Date', true), number('participant_count', 'Participant Count', true),
    number('planned_cost', 'Planned Cost'), number('actual_cost', 'Actual Cost'),
    select('status', 'Status', ['planned', 'approved', 'ongoing', 'completed', 'cancelled'], true),
    number('completion_percentage', 'Completion Percentage', true, 0, 100),
    { name: 'certificate_link', label: 'Certificate Link', type: 'url' }, notes,
  ],
  columns: [
    { key: 'training_title', label: 'Training' }, { key: 'category', label: 'Category' }, { key: 'provider', label: 'Provider' },
    { key: 'start_date', label: 'Start Date', kind: 'date' }, { key: 'participant_count', label: 'Participants' },
    { key: 'completion_percentage', label: 'Completion', render: (row) => `${row.completion_percentage || 0}%` },
    { key: 'status', label: 'Status', kind: 'status' },
  ],
};

export const competencyConfig = {
  title: 'Competency', singular: 'competency assessment', service: competencyService,
  description: 'Assess current capability against target proficiency levels.',
  empty: 'No competency assessments have been added.',
  search: ['competency_name', 'competency_category', 'assessor'],
  fields: [
    { name: 'employee_id', label: 'Employee', required: true, relation: 'employees' }, { name: 'competency_name', label: 'Competency Name', required: true },
    { name: 'competency_category', label: 'Competency Category', required: true },
    number('current_level', 'Current Level', true, 1, 5), number('target_level', 'Target Level', true, 1, 5),
    date('assessment_date', 'Assessment Date', true), { name: 'assessor', label: 'Assessor' },
    { name: 'development_action', label: 'Development Action', type: 'textarea', full: true },
    date('next_review_date', 'Next Review Date'), notes,
  ],
  columns: [
    { key: 'competency_name', label: 'Competency' }, { key: 'competency_category', label: 'Category' },
    { key: 'current_level', label: 'Current' }, { key: 'target_level', label: 'Target' },
    { key: 'gap', label: 'Gap', render: (row) => calculateCompetencyGap(row.current_level, row.target_level) },
    { key: 'result', label: 'Result', render: (row) => row.current_level >= row.target_level ? 'Achieved' : 'Not achieved' },
    { key: 'assessment_date', label: 'Assessed', kind: 'date' },
  ],
};

export const auditConfig = {
  title: 'Audit Readiness', singular: 'audit record', service: auditService,
  description: 'Organise standards, evidence requirements, ownership, and readiness scores.',
  empty: 'No audit readiness records have been added.',
  search: ['audit_theme', 'audit_standard', 'clause', 'function', 'requirement'],
  fields: [
    { name: 'audit_theme', label: 'Audit Theme', required: true },
    select('audit_standard', 'Audit Standard', ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 37001', 'ISO 22301', 'Other'], true),
    { name: 'clause', label: 'Clause' }, { name: 'function', label: 'Function', required: true },
    { name: 'requirement', label: 'Requirement', type: 'textarea', full: true, required: true },
    { name: 'evidence_required', label: 'Evidence Required', type: 'textarea', full: true },
    { name: 'evidence_link', label: 'Evidence Link', type: 'url' }, { name: 'person_in_charge', label: 'Person in Charge' },
    date('due_date', 'Due Date'), select('readiness_status', 'Readiness Status', ['not_started', 'in_progress', 'ready', 'needs_improvement', 'overdue'], true),
    number('score', 'Score', false, 0, 100), { name: 'auditor_notes', label: 'Auditor Notes', type: 'textarea', full: true },
    { name: 'internal_notes', label: 'Internal Notes', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'audit_theme', label: 'Theme' }, { key: 'audit_standard', label: 'Standard' }, { key: 'clause', label: 'Clause' },
    { key: 'function', label: 'Function' }, { key: 'due_date', label: 'Due Date', kind: 'date' },
    { key: 'score', label: 'Score' }, { key: 'readiness_status', label: 'Status', kind: 'status' },
  ],
};

export const documentConfig = {
  title: 'Document Center', singular: 'document', service: documentService,
  description: 'Maintain controlled links to HC policies, evidence, and working documents.',
  empty: 'No documents have been added to the repository.',
  search: ['document_name', 'document_category', 'document_number', 'owner_function'],
  fields: [
    { name: 'document_name', label: 'Document Name', required: true }, { name: 'document_category', label: 'Document Category', required: true },
    { name: 'document_number', label: 'Document Number' }, { name: 'revision', label: 'Revision' },
    { name: 'owner_function', label: 'Owner Function', required: true }, { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'file_url', label: 'External File URL', type: 'url', required: true }, { name: 'file_type', label: 'File Type' },
    number('file_size', 'File Size (bytes)'), date('effective_date', 'Effective Date'), date('review_date', 'Review Date'),
    select('status', 'Status', ['draft', 'active', 'under_review', 'expired', 'archived'], true),
  ],
  columns: [
    { key: 'document_name', label: 'Document' }, { key: 'document_category', label: 'Category' },
    { key: 'document_number', label: 'Number' }, { key: 'owner_function', label: 'Owner' },
    { key: 'status', label: 'Status', kind: 'status' }, { key: 'review_date', label: 'Review Date', kind: 'date' },
    { key: 'file_url', label: 'File', kind: 'url' },
  ],
};
