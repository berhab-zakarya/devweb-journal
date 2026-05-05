'use client';

import { Card, SectionHeader } from '@/shared/components/ui';

export function AccountSecurityCard() {
  return (
    <Card>
      <SectionHeader title="Account security" className="mb-3" />
      <ul className="text-sm text-secondary space-y-2 list-disc list-inside">
        <li>Use a unique password for this journal account.</li>
        <li>Sign out from shared devices when finished.</li>
        <li>Contact an administrator if you notice suspicious activity.</li>
      </ul>
    </Card>
  );
}
