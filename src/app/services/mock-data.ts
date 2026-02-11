import { Dashboard, Report, View, Field, ContentUserRole } from '../models/content.models';

// ── Fields (20) ──────────────────────────────────────────────
export const MOCK_FIELDS: Field[] = [
  { id: 'f1',  name: 'Employee ID',        description: 'Unique employee identifier',           viewIds: ['v1', 'v2', 'v3'] },
  { id: 'f2',  name: 'Full Name',           description: 'Employee full name',                   viewIds: ['v1', 'v2', 'v3', 'v4'] },
  { id: 'f3',  name: 'Department',          description: 'Department assignment',                viewIds: ['v1', 'v2', 'v4'] },
  { id: 'f4',  name: 'Job Title',           description: 'Current job title',                    viewIds: ['v1', 'v2'] },
  { id: 'f5',  name: 'Hire Date',           description: 'Date of hire',                         viewIds: ['v1', 'v3'] },
  { id: 'f6',  name: 'Employment Status',   description: 'Active, terminated, on leave',         viewIds: ['v1'] },
  { id: 'f7',  name: 'Manager',             description: 'Direct manager name',                  viewIds: ['v1', 'v4'] },
  { id: 'f8',  name: 'Location',            description: 'Work location',                        viewIds: ['v1', 'v2'] },
  { id: 'f9',  name: 'Base Salary',         description: 'Annual base salary',                   viewIds: ['v2'] },
  { id: 'f10', name: 'Total Compensation',  description: 'Total comp including bonus/equity',    viewIds: ['v2'] },
  { id: 'f11', name: 'Pay Grade',           description: 'Compensation pay grade',               viewIds: ['v2'] },
  { id: 'f12', name: 'Bonus Target %',      description: 'Target bonus percentage',              viewIds: ['v2'] },
  { id: 'f13', name: 'Absence Type',        description: 'Type of absence (sick, vacation, etc)', viewIds: ['v3'] },
  { id: 'f14', name: 'Absence Start Date',  description: 'Start date of absence',               viewIds: ['v3'] },
  { id: 'f15', name: 'Absence End Date',    description: 'End date of absence',                  viewIds: ['v3'] },
  { id: 'f16', name: 'Absence Hours',       description: 'Total hours of absence',               viewIds: ['v3'] },
  { id: 'f17', name: 'Review Score',        description: 'Performance review score',              viewIds: ['v4'] },
  { id: 'f18', name: 'Review Period',       description: 'Performance review period',             viewIds: ['v4'] },
  { id: 'f19', name: 'Goals Completed',     description: 'Number of goals completed',             viewIds: ['v4'] },
  { id: 'f20', name: 'Potential Rating',    description: 'Future potential assessment',            viewIds: ['v4'] },
];

// ── Views (5) ────────────────────────────────────────────────
export const MOCK_VIEWS: View[] = [
  { id: 'v1', name: 'Employee Core View',        description: 'Core employee demographic and job data',   fieldIds: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'] },
  { id: 'v2', name: 'Compensation View',          description: 'Salary and compensation data',            fieldIds: ['f1', 'f2', 'f3', 'f4', 'f8', 'f9', 'f10', 'f11', 'f12'] },
  { id: 'v3', name: 'Absence View',               description: 'Employee absence and leave data',         fieldIds: ['f1', 'f2', 'f5', 'f13', 'f14', 'f15', 'f16'] },
  { id: 'v4', name: 'Performance View',           description: 'Performance reviews and goals',           fieldIds: ['f2', 'f3', 'f7', 'f17', 'f18', 'f19', 'f20'] },
  { id: 'v5', name: 'Org Hierarchy View',         description: 'Organizational structure and reporting lines', fieldIds: ['f1', 'f2', 'f3', 'f7', 'f8'] },
];

// ── Reports (10) ─────────────────────────────────────────────
export const MOCK_REPORTS: Report[] = [
  { id: 'r1',  name: 'Headcount Summary',           description: 'Current headcount by department and location',     viewId: 'v1', fieldIds: ['f1', 'f2', 'f3', 'f6', 'f8'] },
  { id: 'r2',  name: 'New Hire Report',              description: 'Recent hires within selected period',             viewId: 'v1', fieldIds: ['f1', 'f2', 'f3', 'f4', 'f5', 'f7'] },
  { id: 'r3',  name: 'Termination Report',           description: 'Employee terminations and reasons',              viewId: 'v1', fieldIds: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] },
  { id: 'r4',  name: 'Compensation Overview',        description: 'Salary distribution across the organization',     viewId: 'v2', fieldIds: ['f1', 'f2', 'f3', 'f9', 'f10', 'f11'] },
  { id: 'r5',  name: 'Salary Band Analysis',         description: 'Pay grade distribution and outliers',            viewId: 'v2', fieldIds: ['f2', 'f3', 'f4', 'f9', 'f11', 'f12'] },
  { id: 'r6',  name: 'Absence Detail Report',        description: 'Detailed absence records by employee',           viewId: 'v3', fieldIds: ['f1', 'f2', 'f13', 'f14', 'f15', 'f16'] },
  { id: 'r7',  name: 'Absence Summary',              description: 'Absence hours aggregated by type and department', viewId: 'v3', fieldIds: ['f2', 'f3', 'f13', 'f16'] },
  { id: 'r8',  name: 'Performance Ratings',          description: 'Performance review scores by department',        viewId: 'v4', fieldIds: ['f2', 'f3', 'f17', 'f18'] },
  { id: 'r9',  name: 'Goal Completion Report',       description: 'Goal achievement rates across teams',            viewId: 'v4', fieldIds: ['f2', 'f7', 'f17', 'f19'] },
  { id: 'r10', name: 'Talent Assessment Matrix',     description: 'Performance vs potential 9-box grid',            viewId: 'v4', fieldIds: ['f2', 'f3', 'f17', 'f20'] },
];

// ── Dashboards (4) ───────────────────────────────────────────
export const MOCK_DASHBOARDS: Dashboard[] = [
  { id: 'd1', name: 'Headcount Dashboard',       description: 'Overview of workforce headcount and movement',   reportIds: ['r1', 'r2', 'r3'] },
  { id: 'd2', name: 'Compensation Dashboard',    description: 'Compensation analytics and pay equity',          reportIds: ['r4', 'r5'] },
  { id: 'd3', name: 'Absence Dashboard',         description: 'Absence trends and leave management',            reportIds: ['r6', 'r7'] },
  { id: 'd4', name: 'Performance Dashboard',     description: 'Performance management and talent assessment',   reportIds: ['r8', 'r9', 'r10'] },
];

// ── Default Roles ────────────────────────────────────────────
export const MOCK_ROLES: ContentUserRole[] = [
  {
    id: 'role1',
    name: 'HR Analyst',
    description: 'Full access to headcount and absence data',
    dashboardIds: ['d1', 'd3'],
    reportIds: ['r1', 'r2', 'r3', 'r6', 'r7'],
    viewIds: ['v1', 'v3'],
    fieldIds: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f13', 'f14', 'f15', 'f16'],
  },
  {
    id: 'role2',
    name: 'Compensation Manager',
    description: 'Access to compensation data with partial headcount',
    dashboardIds: ['d2'],
    reportIds: ['r4', 'r5'],
    viewIds: ['v2'],
    fieldIds: ['f1', 'f2', 'f3', 'f4', 'f8', 'f9', 'f10', 'f11', 'f12'],
  },
  {
    id: 'role3',
    name: 'People Manager (Limited)',
    description: 'Performance dashboards only — missing some field access to demonstrate warnings',
    dashboardIds: ['d4'],
    reportIds: ['r8', 'r9', 'r10'],
    viewIds: ['v4'],
    fieldIds: ['f2', 'f3', 'f17', 'f18'],  // Missing f7, f19, f20 — will trigger warnings
  },
];
