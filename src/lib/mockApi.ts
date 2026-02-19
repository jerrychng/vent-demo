/**
 * In-memory mock API for development without a backend.
 * Enable with NEXT_PUBLIC_USE_MOCK_API=true
 */

import type {
  User,
  UserRole,
  JobRow,
  JobDetail,
  Site,
  SiteListItem,
  TemplateArea,
  TemplateListItem,
  UserListItem
} from "@/types/models";

// --- In-memory state ---
let nextUserId = 1;
const users: User[] = [];
const tokenToUser = new Map<string, User>();

function base64urlEncode(obj: object): string {
  const json = JSON.stringify(obj);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createFakeJwt(user: User): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: String(user.id),
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24h
  };
  return `${base64urlEncode(header)}.${base64urlEncode(payload)}.mock`;
}

function decodeMockJwt(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
    const json =
      typeof atob !== "undefined"
        ? decodeURIComponent(escape(atob(padded)))
        : (typeof Buffer !== "undefined" ? Buffer.from(padded, "base64").toString("utf8") : "");
    const p = JSON.parse(json);
    return {
      id: Number(p.sub),
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      is_active: true,
    };
  } catch {
    return null;
  }
}

function getUserForToken(token: string | null): User | null {
  if (!token) return null;
  const fromMap = tokenToUser.get(token);
  if (fromMap) return fromMap;
  return decodeMockJwt(token);
}

const now = () => new Date().toISOString();

// --- Mock sites (shared with job details) ---
let nextSiteId = 3;
const mockSites: Site[] = [
  {
    id: 1,
    client_name: "Big Easy",
    site_name: "Canary Wharf",
    address_line_1: "123 High Street",
    address_line_2: null,
    city: "London",
    postcode: "SW1A 1AA",
    contact_name: null,
    contact_phone: null,
    contact_email: null,
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: now()
  },
  {
    id: 2,
    client_name: "Big Easy",
    site_name: "Site B",
    address_line_1: "45 Industrial Rd",
    address_line_2: "Unit 2",
    city: "Manchester",
    postcode: "M1 2AB",
    contact_name: null,
    contact_phone: null,
    contact_email: null,
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: now()
  }
];

// --- Mock templates + areas ---
let nextTemplateId = 2;
let nextAreaId = 3;
let nextCaptureId = 2;
const mockTemplates: Array<TemplateListItem & { areas?: TemplateArea[] }> = [
  {
    id: 1,
    name: "Kitchen Extract Clean",
    description: "TR19 compliant kitchen extract system cleaning",
    area_count: 1,
    is_active: true,
    created_at: "2026-01-10T09:00:00Z",
    areas: [
      {
        id: 1,
        template_id: 1,
        name: "Main Canopy",
        description: null,
        order_index: 1,
        photo_guidance: "Photograph from below, capture full width",
        created_at: now()
      }
    ]
  }
];
const mockTemplateAreas: TemplateArea[] = [
  { id: 1, template_id: 1, name: "Main Canopy", description: null, order_index: 1, photo_guidance: "Photograph from below, capture full width", created_at: now() }
];

// Mock job details (full Site, WorkCaptureWithArea) for GET /jobs/:id
let nextJobId = 3;
const mockJobDetails: Record<string, JobDetail> = {
  "1": {
    id: 1,
    reference: "JOB-20260131-A3F2",
    title: "Electrical inspection",
    description: "Annual electrical safety check",
    status: "submitted",
    scheduled_date: null,
    started_at: null,
    submitted_at: now(),
    reviewed_at: null,
    review_notes: null,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: now(),
    site: {
      id: 1,
      client_name: "Big Easy",
      site_name: "Canary Wharf",
      address_line_1: "123 High Street",
      address_line_2: null,
      city: "London",
      postcode: "SW1A 1AA",
      contact_name: null,
      contact_phone: null,
      contact_email: null,
      notes: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: now(),
    },
    engineer: { id: 1, full_name: "Jane Engineer" },
    captures: [
      {
        id: 1,
        job_id: 1,
        template_area_id: 1,
        area_name: "Main Canopy",
        order_index: 0,
        pre_image_url: null,
        pre_thumbnail_url: null,
        pre_captured_at: null,
        post_image_url: null,
        post_thumbnail_url: null,
        post_captured_at: null,
        notes: null,
        created_at: now(),
        updated_at: now(),
      },
    ],
  },
  "2": {
    id: 2,
    reference: "JOB-20260131-B4E1",
    title: "Plumbing repair",
    description: null,
    status: "in_progress",
    scheduled_date: null,
    started_at: null,
    submitted_at: null,
    reviewed_at: null,
    review_notes: null,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: now(),
    site: {
      id: 2,
      client_name: "Big Easy",
      site_name: "Site B",
      address_line_1: "45 Industrial Rd",
      address_line_2: "Unit 2",
      city: "Manchester",
      postcode: "M1 2AB",
      contact_name: null,
      contact_phone: null,
      contact_email: null,
      notes: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: now(),
    },
    engineer: { id: 2, full_name: "Bob Smith" },
    captures: [],
  },
};

function getJobList(status?: string): JobRow[] {
  const list: JobRow[] = Object.values(mockJobDetails).map((j) => ({
    id: j.id,
    reference: j.reference,
    title: j.title,
    status: j.status,
    site: {
      client_name: j.site.client_name,
      site_name: j.site.site_name,
      address_line_1: j.site.address_line_1,
      address_line_2: j.site.address_line_2,
      city: j.site.city,
      postcode: j.site.postcode,
    },
    engineer: j.engineer ? { id: j.engineer.id, full_name: j.engineer.full_name } : null,
    scheduled_date: j.scheduled_date,
    created_at: j.created_at,
  }));
  if (status) return list.filter((j) => j.status === status);
  return list;
}

async function handleMock(path: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || "GET").toUpperCase();
  const url = path.startsWith("/") ? path : `/${path}`;
  const [pathname, query] = url.split("?");
  const params = new URLSearchParams(query || "");
  const body = options.body ? JSON.parse(options.body as string) : {};

  // --- Auth: extract token from header (caller passes it like real fetch) ---
  const authHeader = (options.headers as Record<string, string>)?.Authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "") || null;

  // POST /auth/login
  if (pathname === "/auth/login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password) throw new Error("detail" in body ? body.detail : "Email and password required");
    let user = users.find((u) => u.email === email);
    if (!user) {
      const ts = new Date().toISOString();
      user = {
        id: nextUserId++,
        email,
        full_name: email.split("@")[0].replace(/\./g, " ") || "User",
        role: "trade_manager",
        is_active: true,
        created_by: null,
        created_at: ts,
        updated_at: ts,
      };
      users.push(user);
    }
    const access_token = createFakeJwt(user);
    tokenToUser.set(access_token, user);
    return { access_token, token_type: "bearer", user };
  }

  // GET /auth/me
  if (pathname === "/auth/me" && method === "GET") {
    const user = getUserForToken(token);
    if (!user) {
      const err = new Error("Unauthorized") as Error & { status?: number };
      err.status = 401;
      throw err;
    }
    const ts = new Date().toISOString();
    return {
      ...user,
      is_active: true,
      created_by: user.created_by ?? null,
      created_at: user.created_at || ts,
      updated_at: user.updated_at || ts,
    };
  }

  // POST /auth/setup
  if (pathname === "/auth/setup" && method === "POST") {
    if (users.length > 0) throw new Error("Setup already completed");
    const { email, password, full_name } = body;
    if (!email || !password || !full_name) throw new Error("email, password and full_name required");
    const ts = new Date().toISOString();
    const user: User = {
      id: nextUserId++,
      email,
      full_name,
      role: "super_admin",
      is_active: true,
      created_by: null,
      created_at: ts,
      updated_at: ts,
    };
    users.push(user);
    return user;
  }

  // All routes below require auth
  if (!getUserForToken(token)) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  // GET /jobs
  if (pathname === "/jobs" && method === "GET") {
    const status = params.get("status") || undefined;
    const jobs = getJobList(status);
    return { jobs, total: jobs.length };
  }

  // POST /jobs
  if (pathname === "/jobs" && method === "POST") {
    const { title, description, site_id, template_id, engineer_id, scheduled_date } = body as {
      title?: string;
      description?: string | null;
      site_id?: number;
      template_id?: number;
      engineer_id?: number | null;
      scheduled_date?: string | null;
    };

    if (!title || !site_id || !template_id) {
      throw new Error("title, site_id and template_id are required");
    }

    const site = mockSites.find((s) => s.id === Number(site_id));
    if (!site) throw new Error("Site not found");

    const template = mockTemplates.find((t) => t.id === Number(template_id));
    if (!template) throw new Error("Template not found");

    const engineer =
      engineer_id === null || engineer_id === undefined
        ? null
        : users.find((u) => u.id === Number(engineer_id) && u.role === "engineer") ?? null;

    const ts = now();
    const id = nextJobId++;
    const reference = `JOB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(id).padStart(4, "0")}`;
    const templateAreas = (template.areas ?? mockTemplateAreas.filter((a) => a.template_id === template.id)).slice();

    mockJobDetails[String(id)] = {
      id,
      reference,
      title,
      description: description ?? null,
      status: engineer ? "assigned" : "draft",
      scheduled_date: scheduled_date ?? null,
      started_at: null,
      submitted_at: null,
      reviewed_at: null,
      review_notes: null,
      created_at: ts,
      updated_at: ts,
      site,
      engineer: engineer ? { id: engineer.id, full_name: engineer.full_name } : null,
      captures: templateAreas.map((area) => ({
        id: nextCaptureId++,
        job_id: id,
        template_area_id: area.id,
        area_name: area.name,
        order_index: area.order_index,
        pre_image_url: null,
        pre_thumbnail_url: null,
        pre_captured_at: null,
        post_image_url: null,
        post_thumbnail_url: null,
        post_captured_at: null,
        notes: null,
        created_at: ts,
        updated_at: ts,
      })),
    };

    return mockJobDetails[String(id)];
  }

  // GET /jobs/:id
  const jobIdMatch = pathname.match(/^\/jobs\/(\d+)$/);
  if (jobIdMatch && method === "GET") {
    const id = jobIdMatch[1];
    const job = mockJobDetails[id];
    if (!job) throw new Error("Job not found");
    return job;
  }

  // POST /jobs/:id/approve
  const approveMatch = pathname.match(/^\/jobs\/(\d+)\/approve$/);
  if (approveMatch && method === "POST") {
    const id = approveMatch[1];
    const job = mockJobDetails[id];
    if (job) job.status = "approved";
    return {};
  }

  // POST /jobs/:id/reject
  const rejectMatch = pathname.match(/^\/jobs\/(\d+)\/reject$/);
  if (rejectMatch && method === "POST") {
    const id = rejectMatch[1];
    const job = mockJobDetails[id];
    if (job) job.status = "rejected";
    return {};
  }

  const currentUser = getUserForToken(token)!;

  // GET /sites
  if (pathname === "/sites" && method === "GET") {
    const search = params.get("search")?.toLowerCase() || "";
    let list: SiteListItem[] = mockSites.map((s) => ({
      id: s.id,
      client_name: s.client_name,
      site_name: s.site_name,
      address_line_1: s.address_line_1,
      address_line_2: s.address_line_2,
      city: s.city,
      postcode: s.postcode,
      job_count: Object.values(mockJobDetails).filter((j) => j.site.id === s.id).length
    }));
    if (search) {
      list = list.filter(
        (s) =>
          s.client_name.toLowerCase().includes(search) ||
          (s.site_name?.toLowerCase().includes(search)) ||
          s.postcode.toLowerCase().includes(search)
      );
    }
    return { sites: list, total: list.length };
  }

  // GET /sites/:id
  const siteIdMatch = pathname.match(/^\/sites\/(\d+)$/);
  if (siteIdMatch && method === "GET") {
    const id = parseInt(siteIdMatch[1], 10);
    const site = mockSites.find((s) => s.id === id);
    if (!site) throw new Error("Site not found");
    return site;
  }

  // POST /sites
  if (pathname === "/sites" && method === "POST") {
    const { client_name, site_name, address_line_1, address_line_2, city, postcode, contact_name, contact_phone, contact_email, notes } = body;
    if (!client_name || !address_line_1 || !city || !postcode) throw new Error("client_name, address_line_1, city, postcode required");
    const ts = now();
    const site: Site = {
      id: nextSiteId++,
      client_name,
      site_name: site_name ?? null,
      address_line_1,
      address_line_2: address_line_2 ?? null,
      city,
      postcode,
      contact_name: contact_name ?? null,
      contact_phone: contact_phone ?? null,
      contact_email: contact_email ?? null,
      notes: notes ?? null,
      created_at: ts,
      updated_at: ts
    };
    mockSites.push(site);
    return site;
  }

  // GET /templates
  if (pathname === "/templates" && method === "GET") {
    const isActive = params.get("is_active");
    let list: TemplateListItem[] = mockTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      area_count: t.area_count,
      is_active: t.is_active,
      created_at: t.created_at
    }));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      const active = isActive === "true";
      list = list.filter((t) => t.is_active === active);
    }
    return { templates: list };
  }

  // GET /templates/:id
  const templateIdMatch = pathname.match(/^\/templates\/(\d+)$/);
  if (templateIdMatch && method === "GET") {
    const id = parseInt(templateIdMatch[1], 10);
    const t = mockTemplates.find((x) => x.id === id);
    if (!t) throw new Error("Template not found");
    const areas = t.areas ?? mockTemplateAreas.filter((a) => a.template_id === id);
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      area_count: t.area_count,
      is_active: t.is_active,
      created_at: t.created_at,
      areas
    };
  }

  // POST /templates
  if (pathname === "/templates" && method === "POST") {
    const { name, description, areas } = body;
    if (!name || !Array.isArray(areas)) throw new Error("name and areas array required");
    const ts = now();
    const templateId = nextTemplateId++;
    const createdBy = currentUser.id;
    const areaList = (areas as Array<{ name: string; order_index: number; photo_guidance?: string }>).map((a, i) => {
      const area: TemplateArea = {
        id: nextAreaId++,
        template_id: templateId,
        name: a.name || `Area ${i + 1}`,
        description: null,
        order_index: typeof a.order_index === "number" ? a.order_index : i + 1,
        photo_guidance: a.photo_guidance ?? null,
        created_at: ts
      };
      mockTemplateAreas.push(area);
      return area;
    });
    const template: TemplateListItem & { areas: TemplateArea[] } = {
      id: templateId,
      name,
      description: description ?? null,
      area_count: areaList.length,
      is_active: true,
      created_at: ts,
      areas: areaList
    };
    mockTemplates.push(template);
    return { id: templateId, name, areas: areaList };
  }

  // GET /users
  if (pathname === "/users" && method === "GET") {
    const roleFilter = params.get("role");
    const isActiveParam = params.get("is_active");
    let list: UserListItem[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      is_active: u.is_active ?? true,
      created_at: u.created_at
    }));
    if (currentUser.role === "trade_manager") list = list.filter((u) => u.role === "engineer");
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    if (isActiveParam !== null && isActiveParam !== undefined && isActiveParam !== "") {
      list = list.filter((u) => u.is_active === (isActiveParam === "true"));
    }
    return { users: list, total: list.length };
  }

  // GET /users/:id
  const userIdMatch = pathname.match(/^\/users\/(\d+)$/);
  if (userIdMatch && method === "GET") {
    const id = parseInt(userIdMatch[1], 10);
    const u = users.find((x) => x.id === id);
    if (!u) throw new Error("User not found");
    return { id: u.id, email: u.email, full_name: u.full_name, role: u.role, is_active: u.is_active, created_at: u.created_at, updated_at: u.updated_at };
  }

  // POST /users
  if (pathname === "/users" && method === "POST") {
    const { email, password, full_name, role: requestedRole } = body;
    if (!email || !password || !full_name) throw new Error("email, password, full_name required");
    const role = (requestedRole as UserRole) || "engineer";
    if (currentUser.role === "trade_manager" && role !== "engineer") {
      const err = new Error("Trade managers can only create engineers") as Error & { status?: number };
      err.status = 403;
      throw err;
    }
    const ts = now();
    const newUser: User = {
      id: nextUserId++,
      email,
      full_name,
      role,
      is_active: true,
      created_by: currentUser.id,
      created_at: ts,
      updated_at: ts
    };
    users.push(newUser);
    return { id: newUser.id, email: newUser.email, full_name: newUser.full_name, role: newUser.role, is_active: newUser.is_active };
  }

  throw new Error(`Mock API: unknown route ${method} ${pathname}`);
}

/** Same signature as apiFetch; used when NEXT_PUBLIC_USE_MOCK_API is true. */
export async function mockApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", ...(options.headers as object) };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  try {
    const data = await handleMock(path, { ...options, headers });
    return data as T;
  } catch (e: any) {
    if (e.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    throw new Error(e.message || "Request failed");
  }
}
