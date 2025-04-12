import Avvvatars from 'avvvatars-react';
import { Button } from './ui/button';

export default function NameAvatar({ userName }: { userName?: string }) {
  return (
    <Button className="gap-3 rounded-full px-3 ps-2">
      <Avvvatars value={userName ?? ''} style="shape" size={22} />
      {userName}
    </Button>
  );
}
