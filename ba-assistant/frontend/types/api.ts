// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'pro_user' | 'free_user'
  is_active: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  username: string // email used as username for OAuth2 form
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name?: string
}

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentType =
  | 'brd'
  | 'user_story'
  | 'acceptance_criteria'
  | 'uat_checklist'
  | 'process_map'
  | 'communication'

export interface Document {
  id: string
  user_id: string
  title: string
  document_type: DocumentType
  content: string
  input_data: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
}

export interface GenerateBRDRequest {
  project_name: string
  project_description: string
  requirements: string
  scope_in?: string
  scope_out?: string
}

export interface GenerateUserStoriesRequest {
  project_name: string
  requirements: string
  user_personas?: string
}

export interface GenerateAcceptanceCriteriaRequest {
  user_stories: string
}

export interface DocumentResponse {
  id: string
  title: string
  document_type: DocumentType
  content: string
  created_at: string
}

// ─── Elicitation ─────────────────────────────────────────────────────────────

export interface ElicitationSession {
  id: string
  user_id: string
  project_name: string
  project_description: string | null
  scope_in: string | null
  scope_out: string | null
  stakeholders: string | null
  status: 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface GeneratedQuestion {
  id: string
  session_id: string
  question_text: string
  question_category: string
  is_answered: boolean
  answer: string | null
  created_at: string
}

export interface GenerateQuestionsRequest {
  project_name: string
  project_description: string
  stakeholders?: string
}

export interface GenerateQuestionsResponse {
  session_id: string
  questions: Array<{
    category: string
    question: string
    rationale: string
  }>
}

export interface ScopeWizardRequest {
  project_name: string
  project_description: string
  initial_scope: string
}

export interface ScopeWizardResponse {
  scope_definition: string
}

export interface AmbiguityCheckRequest {
  requirements: string
}

export interface AmbiguityCheckResponse {
  ambiguous_terms: Array<{
    term: string
    requirement: string
    issue: string
    suggestion: string
  }>
  gaps: Array<{
    area: string
    missing_info: string
    impact: string
    suggested_question: string
  }>
  conflicts: Array<{
    requirement_a: string
    requirement_b: string
    conflict_description: string
    resolution: string
  }>
  testability_issues: Array<{
    requirement: string
    issue: string
    suggestion: string
  }>
  overall_quality_score: number
  summary: string
}

// ─── Process Maps ─────────────────────────────────────────────────────────────

export interface ProcessAnalysisRequest {
  process_name: string
  process_steps: string
}

export interface ProcessAnalysisResponse {
  id: string
  title: string
  document_type: 'process_map'
  analysis: string
  created_at: string
}

// ─── UAT ──────────────────────────────────────────────────────────────────────

export interface UATChecklistRequest {
  requirements: string
  user_stories: string
}

export interface UATTestCase {
  test_id: string
  category: string
  test_case: string
  scenario: string
  steps: string[]
  expected_result: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface UATChecklistResponse {
  id: string
  title: string
  checklist: UATTestCase[]
  created_at: string
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  error: {
    code: string
    message: string
  }
}
