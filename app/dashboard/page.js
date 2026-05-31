import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard - GitForge',
  description: 'Generate projects and fill your GitHub contribution graph',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  return <DashboardClient session={session} />;
}
