'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  function goToRandomRoomId() {
    const randomRoomId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    router.push(`/room/${randomRoomId}`);
  }

  function goToInputRoomId() {
    const inputRoomId = 'ABCDE';
    router.push(`/room/${inputRoomId}`);
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <div className="text-2xl font-bold">Welcome page</div>
      <div className="flex gap-4">
        <button onClick={goToRandomRoomId}>Go to random room</button>
        <button onClick={goToInputRoomId}>Go to room "ABCDE"</button>
        <Link href={'/profile'}>open user settings modal</Link>
      </div>
    </div>
  );
}
