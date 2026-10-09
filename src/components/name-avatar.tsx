import Avatars from './avatars/avatars';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function NameAvatar({
  userName,
  onLogout,
}: {
  userName?: string;
  onLogout?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="gap-3 rounded-full px-3 ps-2" />}>
        <Avatars value={userName ?? ''} style="shape" size={22} />
        {userName}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            onLogout?.();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
