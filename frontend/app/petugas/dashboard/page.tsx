'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PetugasDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/petugas');
  }, [router]);

  return null;
}
