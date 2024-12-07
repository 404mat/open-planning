'use client';

import { useEffect } from 'react';
import { socketService } from '@/service/socket.service';
import { apiService } from '@/service/api.service';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function App() {
  const router = useRouter();

  useEffect(() => {
    apiService.init();
    socketService.init('http://localhost:3001');

    return () => {
      // Clean up the socket connection
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <LoadingSpinner />
    </div>
  );
}
