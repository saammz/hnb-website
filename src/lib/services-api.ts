const API_URL =
  import.meta.env.VITE_SERVICES_API_URL ?? 'https://api-prod.lightbasemr.com/public-services';
const ORG_SLUG = import.meta.env.VITE_ORG_SLUG ?? 'darlez';

export interface PublicService {
  id: string;
  department: string;
  category: string;
  name: string;
}

export interface PublicServicesResponse {
  organization: { id: string; name: string; slug: string; image: string };
  count: number;
  page: number;
  limit: number;
  total_pages: number;
  departments: string[];
  services: PublicService[];
}

export interface ServicesQuery {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export async function fetchPublicServices(
  { search, department, page = 1, limit = 50 }: ServicesQuery,
  signal?: AbortSignal,
): Promise<PublicServicesResponse> {
  const params = new URLSearchParams({ slug: ORG_SLUG, page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (department) params.set('department', department);

  const res = await fetch(`${API_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`Failed to load services (${res.status})`);
  return res.json();
}
