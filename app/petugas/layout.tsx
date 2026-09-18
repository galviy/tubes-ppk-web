import DashboardShell from '@/components/dashboard/DashboardShell';

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
