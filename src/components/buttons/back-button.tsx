import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BackButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <Button className="group" variant="ghost" onClick={onClick}>
      <ArrowLeftIcon
        className="-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
      {text}
    </Button>
  );
}
