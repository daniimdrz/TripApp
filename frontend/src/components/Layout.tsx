import { AuthProvider } from '../contexts/AuthContexts';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-neutral text-gray-800 font-sans">
        {children}
      </main>
    </AuthProvider>
  );
} 