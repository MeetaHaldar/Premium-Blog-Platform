import { Suspense } from 'react';
import VerifyOTP from '@/components/Auth/VerifyOTP';

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <VerifyOTP />
    </Suspense>
  );
}
