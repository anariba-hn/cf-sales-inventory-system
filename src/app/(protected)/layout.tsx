import { Sidebar } from '@/app/components/layout//sidebar';
import { Header } from '@/app/components/layout/header';

export default async function CFLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
