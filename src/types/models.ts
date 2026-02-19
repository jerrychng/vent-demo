/**
 * Domain models matching backend schema.
 */

/**
 * Role permissions:
 * - super_admin: Can create sites, templates, trade managers, and engineers. Full access.
 * - trade_manager: Can create sites, templates, and engineers. List users, create engineers. Cannot create or manage other trade managers.
 * - engineer: Assigned to jobs; captures work (e.g. pre/post photos). No access to Sites/Templates/Engineer management.
 */
export type UserRole = "super_admin" | "trade_manager" | "engineer";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type Site = {
  id: number;
  client_name: string;
  site_name: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postcode: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Template = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type TemplateArea = {
  id: number;
  template_id: number;
  name: string;
  description: string | null;
  order_index: number;
  photo_guidance: string | null;
  created_at: string;
};

export type JobStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export type Job = {
  id: number;
  reference: string;
  title: string;
  description: string | null;
  site_id: number;
  template_id: number;
  engineer_id: number | null;
  created_by: number;
  status: JobStatus;
  scheduled_date: string | null;
  started_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkCapture = {
  id: number;
  job_id: number;
  template_area_id: number;
  pre_image_url: string | null;
  pre_thumbnail_url: string | null;
  pre_captured_at: string | null;
  post_image_url: string | null;
  post_thumbnail_url: string | null;
  post_captured_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** API list/detail views often embed related entities (no password_hash, etc.). */

export type SiteSummary = Pick<Site, "client_name" | "site_name" | "postcode"> & {
  id?: number;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
};

export type EngineerSummary = Pick<User, "full_name"> & { id?: number };

/** Job list item: job fields plus nested site and engineer summaries. */
export type JobRow = Pick<Job, "id" | "reference" | "title" | "status" | "scheduled_date" | "created_at"> & {
  site: SiteSummary;
  engineer: EngineerSummary | null;
};

/** Work capture with template area info for display (e.g. GET /jobs/:id). */
export type WorkCaptureWithArea = WorkCapture & {
  area_name: string;
  order_index: number;
};

/** Job detail: job with embedded site, engineer, and captures (with area info). */
export type JobDetail = Omit<Job, "site_id" | "template_id" | "engineer_id" | "created_by"> & {
  site: Site;
  engineer: Pick<User, "id" | "full_name"> | null;
  captures: WorkCaptureWithArea[];
};

export type JobsResponse = {
  jobs: JobRow[];
  total: number;
};

/** Site list item (GET /sites). */
export type SiteListItem = {
  id: number;
  client_name: string;
  site_name: string | null;
  address_line_1?: string;
  address_line_2?: string | null;
  city: string;
  postcode: string;
  job_count?: number;
};

export type SitesResponse = {
  sites: SiteListItem[];
  total: number;
};

/** Template list item (GET /templates). */
export type TemplateListItem = {
  id: number;
  name: string;
  description: string | null;
  area_count: number;
  is_active: boolean;
  created_at: string;
};

export type TemplatesResponse = {
  templates: TemplateListItem[];
};

/** Template detail with areas (GET /templates/:id). */
export type TemplateDetail = TemplateListItem & {
  areas: TemplateArea[];
};

/** User list item (GET /users). */
export type UserListItem = Pick<User, "id" | "email" | "full_name" | "role" | "is_active"> & {
  created_at?: string;
};

export type UsersResponse = {
  users: UserListItem[];
  total: number;
};
