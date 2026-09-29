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
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginView />
    </Suspense>
  );
}
