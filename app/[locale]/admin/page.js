import { isAdmin } from '@/lib/admin-auth';
import AdminLogin from '@/components/AdminLogin';
import AdminClient from '@/components/AdminClient';
import { absUrl } from '@/lib/seo';

export const metadata = {
  title: 'Admin',
  description: 'UtilityHub blog admin.',
  robots: { index: false, follow: false },
  alternates: { canonical: absUrl('/admin') },
};

export default async function AdminPage() {
  const authed = await isAdmin();
  return authed ? <AdminClient /> : <AdminLogin />;
}
