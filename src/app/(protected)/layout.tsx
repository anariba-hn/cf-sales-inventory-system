import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import { Sidebar } from '@/app/components/layout/sidebar';
import { Header } from '@/app/components/layout/header';

export default async function CFLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) redirect('/');

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar role={session.role} />
      <div className="flex flex-col flex-1">
        <Header username={session.username} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
