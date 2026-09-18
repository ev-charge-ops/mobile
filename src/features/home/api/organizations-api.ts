import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type MyOrganization = components['schemas']['MyOrganizationDto'];

export async function listMyOrganizations() {
  const { data, response } = await apiClient.GET('/me/organizations');
  if (!response.ok || data === undefined) throw new Error(`Organizations request failed with status ${response.status}`);
  return data;
}
