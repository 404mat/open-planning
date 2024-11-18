// Dependencies: pnpm install lucide-react

import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TextButtonProps {
  text: string;
  onClick: () => void;
}

export default function TextButton(props: TextButtonProps) {
  return (
    <Button className="group" variant="ghost" onClick={props.onClick}>
      <ArrowLeft
        className="-ms-1 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
      {props.text}
    </Button>
  );
}
