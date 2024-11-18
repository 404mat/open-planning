// Dependencies: pnpm install lucide-react

import { Button } from '@/app/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ButtonGoProps {
  text: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'full';
}

export default function ButtonGo(props: ButtonGoProps) {
  return (
    <Button className="group" disabled={props.disabled} size={props.size}>
      {props.text}
      <ArrowRight
        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
    </Button>
  );
}
