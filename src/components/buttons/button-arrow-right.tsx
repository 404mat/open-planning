import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ButtonArrowRight({
  text,
  type,
}: {
  text: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <Button className="group" type={type}>
      {text}
      <ArrowRightIcon
        className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
    </Button>
  );
}
