import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getAdminSession } from '@/lib/server/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard - EventSync',
  description: 'EventSync admin dashboard.',
};

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <AdminDashboard session={session} />;
}
