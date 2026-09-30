import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginView } from '@/components/LoginView';

export const metadata: Metadata = {
  title: 'Secure Login | Project Financial Tracker',
  description: 'Enterprise access portal for Project Financial Tracker.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginView />
    </Suspense>
  );
}
