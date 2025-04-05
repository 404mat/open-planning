import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function HomepageAvatar({ userName }: { userName?: string }) {
  return (
    <Avatar>
      <AvatarImage src="./avatar-80-07.jpg" alt="Kelly King" />
      <AvatarFallback>
        {userName?.charAt(0).toUpperCase() ?? '?'}
      </AvatarFallback>
    </Avatar>
  );
}
