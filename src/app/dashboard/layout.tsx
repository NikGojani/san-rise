import { ConcertsProvider } from './ConcertsContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConcertsProvider>
      {children}
    </ConcertsProvider>
  );
} 