'use client';

import { useCurrentUser } from '../hooks/useCurrentUser';
import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import {
  PageHeader,
  Card,
  SectionHeader,
  LoadingState,
  ErrorState,
} from '@/shared/components/ui';

export function ProfilePage() {
  const { data: user, isLoading, isError, refetch } = useCurrentUser();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Profile" description="Manage your account information" />
        <div className="space-y-6 max-w-2xl">
          <Card><LoadingState rows={2} /></Card>
          <Card><LoadingState rows={3} /></Card>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div>
        <PageHeader title="Profile" description="Manage your account information" />
        <Card>
          <ErrorState
            message="Could not load your profile."
            onRetry={() => refetch()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account information" />

      <div className="space-y-6 max-w-2xl">
        {/* Personal Information */}
        <Card>
          <SectionHeader title="Personal Information" className="mb-5" />
          <ProfileForm user={user} />
        </Card>

        {/* Change Password */}
        <Card>
          <SectionHeader title="Change Password" className="mb-5" />
          <ChangePasswordForm userName={user.name} userEmail={user.email} />
        </Card>
      </div>
    </div>
  );
}
