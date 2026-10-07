import type { MyOrganization } from '@/features/account/api/organizations-api';

export function formatUnitSubtitle(organizations: MyOrganization[] | undefined) {
  if (!organizations || organizations.length === 0) return undefined;
  const withUnit = organizations.find((organization) => organization.unitLabel);
  if (withUnit?.unitLabel) return `Unidade ${withUnit.unitLabel} · ${withUnit.name}`;
  return organizations[0].name;
}
